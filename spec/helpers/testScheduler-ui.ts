import * as _ from 'lodash';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as marble from './marble-testing';
import { TestScheduler } from 'rxjs/testing';

//tslint:disable:no-var-requires no-require-imports
const commonInterface = require('mocha/lib/interfaces/common');
const escapeRe = require('escape-string-regexp');
//tslint:enable:no-var-requires no-require-imports

/** Polyfill requestAnimationFrame for testing animationFrame scheduler in Node */
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function(this: any, window: any) {
  window = window || this;
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                 || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = (callback: Function, element: any) => {
          const currTime = new Date().getTime();
          const timeToCall = Math.max(0, 16 - (currTime - lastTime));
          const id = window.setTimeout(() => { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };
  }

  if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = (id: number) => {
          clearTimeout(id);
      };
  }
}(global));

//setup sinon-chai
chai.use(sinonChai);

declare const module: any, global: any, Suite: any, Test: any;

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
module.exports = function(suite: any) {
  const suites = [suite];

  suite.on('pre-require', function(context: any, file: any, mocha: any) {
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

    context.describe = context.context = function(title: any, fn: any) {
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

    context.xdescribe = context.xcontext = context.describe.skip = function(title: any, fn: any) {
      const suite = (<any>Suite).create(suites[0], title);
      suite.pending = true;
      suites.unshift(suite);
      fn.call(suite);
      suites.shift();
    };

    /**
     * Exclusive suite.
     */

    context.describe.only = function(title: any, fn: any) {
      const suite = context.describe(title, fn);
      mocha.grep(suite.fullTitle());
      return suite;
    };

    /**
     * Describe a test case to test type definition
     * sanity on build time. Recommended only for
     * exceptional type definition won't be used in test cases.
     */

    context.type = function(title: any, fn: any) {
      //intentionally does not execute to avoid unexpected side effect occurs by subscription,
      //or infinite source. Suffecient to check build time only.
    };

    function stringify(x: any): string {
      return JSON.stringify(x, function (key: string, value: any) {
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

    function deleteErrorNotificationStack(marble: any) {
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

    function observableMatcher(actual: any, expected: any) {
      if (Array.isArray(actual) && Array.isArray(expected)) {
        actual = actual.map(deleteErrorNotificationStack);
        expected = expected.map(deleteErrorNotificationStack);
        const passed = _.isEqual(actual, expected);
        if (passed) {
          return;
        }

        let message = '\nExpected \n';
        actual.forEach((x: any) => message += `\t${stringify(x)}\n`);

        message += '\t\nto deep equal \n';
        expected.forEach((x: any) => message += `\t${stringify(x)}\n`);

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

    const it = context.it = context.specify = function(title: any, fn: any) {
      context.rxTestScheduler = null;
      let modified = fn;

      if (fn && fn.length === 0) {
        modified = function () {
          context.rxTestScheduler = new TestScheduler(observableMatcher);

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
    context.asDiagram = function (label: any) {
      if (diagramFunction) {
        return diagramFunction(label, it);
      }
      return it;
    };

    /**
     * Exclusive test-case.
     */

    context.it.only = function(title: any, fn: any) {
      const test = it(title, fn);
      const reString = '^' + (<any>escapeRe)(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
      return test;
    };

    /**
     * Pending test case.
     */

    context.xit = context.xspecify = context.it.skip = function(title: string) {
      context.it(title);
    };

    /**
     * Number of attempts to retry.
     */
    context.it.retries = function(n: number) {
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
  value: function (this: any) {
    const alt = {};

    Object.getOwnPropertyNames(this).forEach(function (this: any, key: string) {
      if (key !== 'stack') {
        alt[key] = this[key];
      }
    }, this);
    return alt;
  },
  configurable: true
});
