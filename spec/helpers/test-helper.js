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
    glit.apply(this, arguments);
  }
};

beforeEach(function () {
  jasmine.addMatchers({
    toDeepEqual: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var result = { pass: _.isEqual(actual, expected) };
          
          if (!result.pass && Array.isArray(actual) && Array.isArray(expected)) {
            result.message = 'Expected \n';
            actual.forEach(function(x) {
              result.message += JSON.stringify(x) + '\n';
            });
            result.message += '\nto deep equal \n';
            expected.forEach(function(x) {
              result.message += JSON.stringify(x) + '\n';
            });
          }
          
          return result;
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


(function (){
  var objectTypes = {
      'boolean': false,
      'function': true,
      'object': true,
      'number': false,
      'string': false,
      'undefined': false
  };
  
  var _root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
  
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
  var freeGlobal = objectTypes[typeof global] && global;
  
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
      _root = freeGlobal;
  }
  
  
  
  global.__root__ = _root;
}());