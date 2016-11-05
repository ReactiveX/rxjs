'use strict';
var Rx = require(__dirname);

var marbleTesting = require('./spec-js/helpers/marble-testing');

global.rxTestScheduler = new Rx.TestScheduler(marbleTesting.assertDeepEqual);

function it(callback) {
  callback();
}

it.asDiagram = function asDiagram() {
  return function (spec, callback) {
    callback();
  }
};

module.exports = {
  require: {
    '@reactivex/rxjs': Rx
  },

  globals: {
    document: {
      querySelector: function () {
        return {
          addEventListener: function () {},
          removeEventListener: function () {}
        }
      }
    },
    hot: marbleTesting.hot,
    cold: marbleTesting.cold,
    expectObservable: marbleTesting.expectObservable,
    expectSubscriptions: marbleTesting.expectSubscriptions,
    assertDeepEqual: marbleTesting.assertDeepEqual,
    Rx: Rx,
    setTimeout: setTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Observable: Rx.Observable,
    someObservable: Rx.Observable.range(1, 10),
    it: it
  },

  regexRequire: {
    'rxjs/(.*)': function (_, moduleName) {
      return require(__dirname + '/dist/cjs/' + moduleName);
    }
  },

  babel: {
    stage: 0
  }
};
