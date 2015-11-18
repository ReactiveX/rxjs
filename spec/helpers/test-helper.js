//Fail timeouts faster
//Individual suites/specs should specify longer timeouts if needed.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

var _ = require('lodash');
var Rx = require('../../dist/cjs/Rx.KitchenSink');

var marbleHelpers = require('./marble-testing');

global.rxTestScheduler = null;
global.cold = marbleHelpers.cold;
global.hot = marbleHelpers.hot;
global.promise = marbleHelpers.promise;
global.expectObservable = marbleHelpers.expectObservable;
global.expectSubscriptions = marbleHelpers.expectSubscriptions;

var assertDeepEqual = marbleHelpers.assertDeepEqual;

var glit = global.it;

global.it = function (description, test, timeout) {
  if (test.length === 0) {
    glit(description, function () {
      global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
      test();
      global.rxTestScheduler.flush();
      global.rxTestScheduler = null;
    });
  } else {
    glit(description, function (done) {
      global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
      test(done);
      global.rxTestScheduler.flush();
      global.rxTestScheduler = null;
    }, timeout);
  }
};

var glfit = global.fit;

global.fit = function (description, test, timeout) {
  if (test.length === 0) {
    glfit(description, function () {
      global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
      test();
      global.rxTestScheduler.flush();
      global.rxTestScheduler = null;
    });
  } else {
    glfit(description, function (done) {
      global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
      test(done);
      global.rxTestScheduler.flush();
    }, timeout);
  }
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

(function () {
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

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

  var _root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);

  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
  var freeGlobal = objectTypes[typeof global] && global;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    _root = freeGlobal;
  }

  global.__root__ = _root;
})();

global.lowerCaseO = function lowerCaseO() {
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
};

var ___start;
beforeEach(function () {
  ___start = Date.now();
});

afterEach(function () {
  var elapsed = Date.now() - ___start;
  if (elapsed > 500) {
    throw 'slow test!';
  }
});
