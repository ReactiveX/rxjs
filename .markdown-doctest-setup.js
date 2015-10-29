'use strict';
let Rx = require('.');

global.jasmine = {};

global.beforeEach = function beforeEach () {};
global.afterEach = function afterEach () {};

require('./spec/helpers/test-helper');

module.exports = {
  require: {
    '@reactivex/rxjs': Rx
  },

  globals: {
    hot,
    cold,
    expectObservable,
    expectSubscriptions,
    assertDeepEqual,
    Observable: Rx.Observable,
    someObservable: Rx.Observable.range(1, 10)
  },

  babel: {
    stage: 0
  }
}

global.rxTestScheduler = new Rx.TestScheduler(assertDeepEqual);
