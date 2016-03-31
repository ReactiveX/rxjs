///<reference path='../../typings/main.d.ts'/>
///<reference path='ambient.d.ts'/>
"use strict";
var _ = require('lodash');
var mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test = require('mocha/lib/test');
var commonInterface = require('mocha/lib/interfaces/common');
var escapeRe = require('escape-string-regexp');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var marble = require('./marble-testing');
//setup sinon-chai
chai.use(sinonChai);
var diagramFunction = global.asDiagram;
//mocha creates own global context per each test suite, simple patching to global won't deliver its context into test cases.
//this custom interface is just mimic of existing one amending test scheduler behavior previously test-helper does via global patching.
module.exports = mocha.interfaces['testscheduler-ui'] = function (suite) {
    var suites = [suite];
    suite.on('pre-require', function (context, file, mocha) {
        var common = commonInterface(suites, context);
        context.before = common.before;
        context.after = common.after;
        context.beforeEach = common.beforeEach;
        context.afterEach = common.afterEach;
        context.run = mocha.options.delay && common.runWithSuite(suite);
        //setting up per-context test scheduler
        context.rxTestScheduler = null;
        //setting up assertion, helper for marble testing
        context.hot = marble.hot;
        context.cold = marble.cold;
        context.expectObservable = marble.expectObservable;
        context.expectSubscriptions = marble.expectSubscriptions;
        context.time = marble.time;
        /**
         * Describe a "suite" with the given `title`
         * and callback `fn` containing nested suites
         * and/or tests.
         */
        context.describe = context.context = function (title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.file = file;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
            return suite;
        };
        /**
         * Pending describe.
         */
        context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.pending = true;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
        };
        /**
         * Exclusive suite.
         */
        context.describe.only = function (title, fn) {
            var suite = context.describe(title, fn);
            mocha.grep(suite.fullTitle());
            return suite;
        };
        /**
         * Describe a test case to test type definition
         * sanity on build time. Recommended only for
         * exceptional type definition won't be used in test cases.
         */
        context.type = function (title, fn) {
            //intentionally does not execute to avoid unexpected side effect occurs by subscription,
            //or infinite source. Suffecient to check build time only.
        };
        function stringify(x) {
            return JSON.stringify(x, function (key, value) {
                if (Array.isArray(value)) {
                    return '[' + value
                        .map(function (i) {
                        return '\n\t' + stringify(i);
                    }) + '\n]';
                }
                return value;
            })
                .replace(/\\"/g, '"')
                .replace(/\\t/g, '\t')
                .replace(/\\n/g, '\n');
        }
        /**
         * custom assertion formatter for expectObservable test
         */
        function observableMatcher(actual, expected) {
            if (Array.isArray(actual) && Array.isArray(expected)) {
                var passed = _.isEqual(actual, expected);
                if (passed) {
                    return;
                }
                var message_1 = '\nExpected \n';
                actual.forEach(function (x) { return message_1 += "\t" + stringify(x) + "\n"; });
                message_1 += '\t\nto deep equal \n';
                expected.forEach(function (x) { return message_1 += "\t" + stringify(x) + "\n"; });
                chai.assert(passed, message_1);
            }
            else {
                chai.assert.deepEqual(actual, expected);
            }
        }
        /**
         * Describe a specification or test-case
         * with the given `title` and callback `fn`
         * acting as a thunk.
         */
        var it = context.it = context.specify = function (title, fn) {
            context.rxTestScheduler = null;
            var modified = fn;
            if (fn && fn.length === 0) {
                modified = function (done) {
                    context.rxTestScheduler = new Rx.TestScheduler(observableMatcher);
                    var error = null;
                    try {
                        fn();
                        context.rxTestScheduler.flush();
                    }
                    catch (e) {
                        error = e instanceof Error ? e : new Error(e);
                    }
                    finally {
                        context.rxTestScheduler = null;
                        error ? done(error) : done();
                    }
                };
            }
            var suite = suites[0];
            if (suite.pending) {
                modified = null;
            }
            var test = new Test(title, modified);
            test.file = file;
            suite.addTest(test);
            return test;
        };
        /**
         * Describe a specification or test-case
         * to be represented as marble diagram png.
         * It will still serve as normal test cases as well.
         */
        context.asDiagram = function (label) {
            if (diagramFunction) {
                return diagramFunction(label, it);
            }
            return it;
        };
        /**
         * Exclusive test-case.
         */
        context.it.only = function (title, fn) {
            var test = it(title, fn);
            var reString = '^' + escapeRe(test.fullTitle()) + '$';
            mocha.grep(new RegExp(reString));
            return test;
        };
        /**
         * Pending test case.
         */
        context.xit = context.xspecify = context.it.skip = function (title) {
            context.it(title);
        };
        /**
         * Number of attempts to retry.
         */
        context.it.retries = function (n) {
            context.retries(n);
        };
    });
};
//overrides JSON.toStringfy to serialize error object
Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
        var alt = {};
        Object.getOwnPropertyNames(this).forEach(function (key) {
            if (key !== 'stack') {
                alt[key] = this[key];
            }
        }, this);
        return alt;
    },
    configurable: true
});
//# sourceMappingURL=testScheduler-ui.js.map