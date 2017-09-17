///<reference path='../../typings/index.d.ts'/>
///<reference path='ambient.d.ts'/>

import * as _ from 'lodash';
import * as commonInterface from 'mocha/lib/interfaces/common';
import * as escapeRe from 'escape-string-regexp';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';

import * as Rx from '../../dist/package/Rx';
import * as marble from './marble-testing';

//setup sinon-chai
chai.use(sinonChai);

declare const module, global, Suite, Test: any;

if (global && !(typeof window !== 'undefined')) {
  global.mocha = require('mocha'); // tslint:disable-line:no-require-imports no-var-requires
  global.Suite = global.mocha.Suite;
  global.Test = global.mocha.Test;
}

if (!global.Promise) {
  global.Promise = require('promise'); // tslint:disable-line:no-require-imports no-var-requires
}

const diagramFunction = global.asDiagram;

//mocha creates own global context per each test suite, simple patching to global won't deliver its context into test cases.
//this custom interface is just mimic of existing one amending test scheduler behavior previously test-helper does via global patching.
module.exports = function(suite) {
  const suites = [suite];

  suite.on('pre-require', function(context, file, mocha) {
    const common = (<any>commonInterface)(suites, context);

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

    context.describe = context.context = function(title, fn) {
      const suite = (<any>Suite).create(suites[0], title);
      suite.file = file;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
      return suite;
    };

    /**
     * Pending describe.
     */

    context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
      const suite = (<any>Suite).create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title, fn) {
      const suite = context.describe(title, fn);
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

    function stringify(x): string {
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

    function deleteErrorNotificationStack(marble) {
      const { notification } = marble;
      if (notification) {
        const { kind, error } = notification;
        if (kind === 'E' && error instanceof Error) {
          notification.error = { name: error.name, message: error.message };
        }
      }
      return marble;
    }

    /**
     * custom assertion formatter for expectObservable test
     */

    function observableMatcher(actual, expected) {
      if (Array.isArray(actual) && Array.isArray(expected)) {
        actual = actual.map(deleteErrorNotificationStack);
        expected = expected.map(deleteErrorNotificationStack);
        const passed = _.isEqual(actual, expected);
        if (passed) {
          return;
        }

        let message = '\nExpected \n';
        actual.forEach((x) => message += `\t${stringify(x)}\n`);

        message += '\t\nto deep equal \n';
        expected.forEach((x) => message += `\t${stringify(x)}\n`);

        chai.assert(passed, message);
      } else {
        chai.assert.deepEqual(actual, expected);
      }
    }

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    const it = context.it = context.specify = function(title, fn) {
      context.rxTestScheduler = null;
      let modified = fn;

      if (fn && fn.length === 0) {
        modified = function () {
          context.rxTestScheduler = new Rx.TestScheduler(observableMatcher);

          try {
            fn();
            context.rxTestScheduler.flush();
          } finally {
            context.rxTestScheduler = null;
          }
        };
      }

      const suite = suites[0];
      if (suite.pending) {
        modified = null;
      }
      const test = new (<any>Test)(title, modified);
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

    context.it.only = function(title, fn) {
      const test = it(title, fn);
      const reString = '^' + (<any>escapeRe)(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function(n) {
      context.retries(n);
    };
  });
};

//register into global instnace if browser test page injects mocha globally
if (global.Mocha) {
  (<any>window).Mocha.interfaces['testschedulerui'] = module.exports;
} else {
  (<any>mocha).interfaces['testschedulerui'] = module.exports;
}

//overrides JSON.toStringfy to serialize error object
Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    const alt = {};

    Object.getOwnPropertyNames(this).forEach(function (key) {
      if (key !== 'stack') {
        alt[key] = this[key];
      }
    }, this);
    return alt;
  },
  configurable: true
});
