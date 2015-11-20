jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;

var Rx = require('../../../dist/cjs/Rx.KitchenSink');
var marbleHelpers = require('../marble-testing');
var painter = require('./painter');

global.rxTestScheduler = null;
global.cold = marbleHelpers.cold;
global.hot = marbleHelpers.hot;
global.expectObservable = marbleHelpers.expectObservable;
global.expectSubscriptions = marbleHelpers.expectSubscriptions;

function getInputStreams(rxTestScheduler) {
  return Array.prototype.concat.call([],
    rxTestScheduler.hotObservables
      .map(function (hot) {
        return {
          messages: hot.messages,
          subscription: {start: 0, end: '100%'},
        };
      })
      .slice(),
    rxTestScheduler.coldObservables
      .map(function (cold) {
        return {
          messages: cold.messages,
          cold: cold,
        };
      })
      .slice()
  );
}

function updateInputStreamsPostFlush(inputStreams, rxTestScheduler) {
  return inputStreams.map(function (singleInputStream) {
    if (singleInputStream.cold) {
      singleInputStream.subscription = {
        start: singleInputStream.cold.subscriptions[0].subscribedFrame,
        end: singleInputStream.cold.subscriptions[0].unsubscribedFrame,
      };
    }
    return singleInputStream;
  });
}

var glit = global.it;

global.it = function (description, specFn, timeout) { };

global.it.asDiagram = function asDiagram(operatorLabel) {
  return function specFnWithPainter(description, specFn) {
    if (specFn.length === 0) {
      glit(description, function () {
        var outputStream;
        global.rxTestScheduler = new Rx.TestScheduler(function (actual) {
          if (Array.isArray(actual) && typeof actual[0].frame === 'number') {
            outputStream = {
              messages: actual,
              subscription: {start: 0, end: '100%'}
            };
          }
          return true;
        });
        specFn();
        var inputStreams = getInputStreams(global.rxTestScheduler);
        global.rxTestScheduler.flush();
        inputStreams = updateInputStreamsPostFlush(inputStreams, rxTestScheduler);
        painter(inputStreams, operatorLabel, outputStream);
        console.log('Painted img/' + operatorLabel + '.png');
      });
    } else {
      throw new Error('Cannot generate PNG marble diagram for async test ' + description);
    }
  };
};

beforeEach(function () {
  jasmine.addMatchers({
    toDeepEqual: function (util, customEqualityTesters) {
      return {
        compare: function (actual, expected) {
          return { pass: true };
        }
      };
    }
  });
});

afterEach(function () {
  global.rxTestScheduler = null;
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

