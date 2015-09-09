//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var _ = require("lodash");
var Rx = require('../../dist/cjs/Rx');

global.rxTestScheduler = null;
global.cold;
global.hot;
global.expectObservable;


global.hot = function () {
  if (!global.rxTestScheduler) {
    throw 'tried to use hot() in async test';
  }
  return global.rxTestScheduler.createHotObservable.apply(global.rxTestScheduler, arguments);
};

global.cold = function () {
  if (!global.rxTestScheduler) {
    throw 'tried to use cold() in async test';
  }
  return global.rxTestScheduler.createColdObservable.apply(global.rxTestScheduler, arguments);
};

global.expectObservable = function () {
  if (!global.rxTestScheduler) {
    throw 'tried to use expectObservable() in async test';
  }
  return global.rxTestScheduler.expect.apply(global.rxTestScheduler, arguments);
};

var glit = global.it;

global.it = function (description, cb, timeout) {
  if (cb.length === 0) {
    glit(description, function () {
      global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
      cb();
      global.rxTestScheduler.flush();
    });
  } else {
    if (description === 'should work with never and empty') {
      console.log("TEST");
    }
    glit.apply(this, arguments);
  }
};

beforeEach(function () {
  jasmine.addMatchers({
    toDeepEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          return { pass: _.isEqual(actual, expected) };
        }
      };
    }
  });
});

afterEach(function () {
  global.rxTestScheduler = null;
});

function assertDeepEqual(actual, expected) {
  expect(actual).toDeepEqual(expected);
}