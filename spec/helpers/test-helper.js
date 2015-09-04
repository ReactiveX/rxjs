//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var _ = require("lodash");
var Rx = require('../../dist/cjs/Rx');

global.rxTestScheduler = null;
global.cold;
global.hot;
global.expectObservable;


beforeEach(function () {
  global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
  global.hot = function () {
    setupFlush();
    return global.rxTestScheduler.createHotObservable.apply(global.rxTestScheduler, arguments);
  };
  global.cold = function () {
    setupFlush();
    return global.rxTestScheduler.createColdObservable.apply(global.rxTestScheduler, arguments);
  };
  global.expectObservable = global.rxTestScheduler.expect.bind(global.rxTestScheduler);
  
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

var glit = global.it;
var willFlush = false;

afterEach(function () {
  willFlush = false;
  global.it = glit;
});

function assertDeepEqual(actual, expected) {
  return expect(actual).toDeepEqual(actual);
}

function setupFlush() {
  willFlush = true;
  global.it = function () {
    glit.apply(this, arguments);
    global.rxTestScheduler.flush();
  };
}