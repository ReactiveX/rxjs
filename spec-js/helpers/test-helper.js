"use strict";
///<reference path='../../typings/main.d.ts'/>
//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
var _ = require('lodash');
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var root_1 = require('../../dist/cjs/util/root');
var marbleHelpers = require('./marble-testing');
global.rxTestScheduler = null;
global.cold = marbleHelpers.cold;
global.hot = marbleHelpers.hot;
global.time = marbleHelpers.time;
global.expectObservable = marbleHelpers.expectObservable;
global.expectSubscriptions = marbleHelpers.expectSubscriptions;
global.type = type;
var defaultAssertion = global.it;
var singleAssertion = global.fit;
function assertAction(done, assertion) {
    global.rxTestScheduler = new Rx.TestScheduler(marbleHelpers.assertDeepEqual);
    var error;
    var errorHappened = false;
    try {
        assertion();
        global.rxTestScheduler.flush();
    }
    catch (e) {
        errorHappened = true;
        error = e;
    }
    finally {
        if (errorHappened) {
            setTimeout(function () { done.fail(error); });
        }
        else {
            setTimeout(function () { done(); });
        }
    }
}
function asDiagram(expectation) {
    return it;
}
exports.asDiagram = asDiagram;
function it(expectation, assertion, timeout) {
    if (assertion.length === 0) {
        defaultAssertion(expectation, function (done) {
            assertAction(done, assertion);
        });
    }
    else {
        defaultAssertion.apply(this, arguments);
    }
}
exports.it = it;
function fit(expectation, assertion, timeout) {
    if (assertion.length === 0) {
        singleAssertion(expectation, function (done) {
            assertAction(done, assertion);
        });
    }
    else {
        singleAssertion.apply(this, arguments);
    }
}
exports.fit = fit;
global.it = it;
global.fit = fit;
if (!global.asDiagram) {
    global.asDiagram = asDiagram;
}
function type(assertion) {
    //intentionally does not execute to avoid unexpected side effect occurs by subscription,
    //or infinite source. Suffecient to check build time only.
}
exports.type = type;
function lowerCaseO() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var values = [].slice.apply(arguments);
    var o = {
        subscribe: function (observer) {
            values.forEach(function (v) {
                observer.next(v);
            });
            observer.complete();
        }
    };
    o[Symbol.observable] = function () {
        return this;
    };
    return o;
}
exports.lowerCaseO = lowerCaseO;
;
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
beforeEach(function () {
    jasmine.addMatchers({
        toDeepEqual: function (util, customEqualityTesters) {
            return {
                compare: function (actual, expected) {
                    var result = { pass: _.isEqual(actual, expected) };
                    if (!result.pass && Array.isArray(actual) && Array.isArray(expected)) {
                        result.message = 'Expected \n';
                        actual.forEach(function (x) {
                            result.message += stringify(x) + '\n';
                        });
                        result.message += '\nto deep equal \n';
                        expected.forEach(function (x) {
                            result.message += stringify(x) + '\n';
                        });
                    }
                    return result;
                }
            };
        }
    });
});
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
global.__root__ = root_1.root;
afterEach(function () {
    global.rxTestScheduler = null;
});
//# sourceMappingURL=test-helper.js.map