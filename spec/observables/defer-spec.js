/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.defer', function () {
  it('should create an observable from the provided observbale factory', function () {
    var source = hot('--a--b--c--|');
    var e1 = Observable.defer(function () {
      return source;
    });
    var expected = '--a--b--c--|';

    expectObservable(e1).toBe(expected);
  });

  it('should create an observable from completed', function () {
    var source = hot('|');
    var e1 = Observable.defer(function () {
      return source;
    });
    var expected = '|';

    expectObservable(e1).toBe(expected);
  });

  it('should create an observable from error', function () {
    var source = hot('#');
    var e1 = Observable.defer(function () {
      return source;
    });
    var expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should create an observable when factory throws', function () {
    var e1 = Observable.defer(function () {
      throw 'error';
    });
    var expected = '#';

    expectObservable(e1).toBe(expected);
  });
});
