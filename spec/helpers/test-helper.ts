///<reference path='../../typings/main.d.ts'/>
declare const global: any;
declare const Symbol: any;

//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

import * as _ from 'lodash';
import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {root} from '../../dist/cjs/util/root';
import * as marbleHelpers from './marble-testing';

global.rxTestScheduler = null;
global.cold = marbleHelpers.cold;
global.hot = marbleHelpers.hot;
global.time = marbleHelpers.time;
global.expectObservable = marbleHelpers.expectObservable;
global.expectSubscriptions = marbleHelpers.expectSubscriptions;
global.type = type;

//amending type definition of jasmine which seems doesn't have this
export interface DoneSignature {
  (): void;
  fail(description?: string): void;
}

const defaultAssertion: (expectation: string, assertion?: (done: DoneSignature) => void, timeout?: number) => void = global.it;
const singleAssertion: (expectation: string, assertion?: (done: DoneSignature) => void, timeout?: number) => void = global.fit;

function assertAction(done: DoneSignature, assertion: (done?: DoneSignature) => void): void {
  global.rxTestScheduler = new Rx.TestScheduler(marbleHelpers.assertDeepEqual);
  let error: any;
  let errorHappened: boolean = false;

  try {
    assertion();
    global.rxTestScheduler.flush();
  } catch (e) {
    errorHappened = true;
    error = e;
  } finally {
    global.rxTestScheduler = null;
    if (errorHappened) {
      done.fail(error);
    } else {
      done();
    }
  }
}

export function asDiagram(expectation: string): (expectation: string, assertion?: (done: DoneSignature) => void, timeout?: number) => void {
  return it;
}

export function it(expectation: string, assertion?: (done?: DoneSignature) => void, timeout?: number): void {
  if (assertion.length === 0) {
    defaultAssertion(expectation, (done: DoneSignature) => {
      assertAction(done, assertion);
    });
  } else {
    defaultAssertion.apply(this, arguments);
  }
}

export function fit(expectation: string, assertion?: (done?: DoneSignature) => void, timeout?: number): void {
  if (assertion.length === 0) {
    singleAssertion(expectation, (done: DoneSignature) => {
      assertAction(done, assertion);
    });
  } else {
    singleAssertion.apply(this, arguments);
  }
}

global.it = it;
global.fit = fit;
if (!global.asDiagram) {
  global.asDiagram = asDiagram;
}

export function type(assertion: Function): void {
  //intentionally does not execute to avoid unexpected side effect occurs by subscription,
  //or infinite source. Suffecient to check build time only.
}

export function lowerCaseO<T>(...args): Rx.Observable<T> {
  const values = [].slice.apply(arguments);

  const o = {
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

  return <any>o;
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

beforeEach(function () {
  jasmine.addMatchers({
    toDeepEqual: function (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          let result: any = { pass: _.isEqual(actual, expected) };

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

global.__root__ = root;

afterEach(function () {
  global.rxTestScheduler = null;
});
