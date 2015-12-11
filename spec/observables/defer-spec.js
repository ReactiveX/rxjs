/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.defer', function () {
  it('should create an observable from the provided observbale factory', function () {
    var source = hot('--a--b--c--|');
    var sourceSubs = '^          !';
    var expected =   '--a--b--c--|';

    var e1 = Observable.defer(function () {
      return source;
    });

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable from completed', function () {
    var source = hot('|');
    var sourceSubs = '(^!)';
    var expected =   '|';

    var e1 = Observable.defer(function () {
      return source;
    });

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable from error', function () {
    var source = hot('#');
    var sourceSubs = '(^!)';
    var expected =   '#';

    var e1 = Observable.defer(function () {
      return source;
    });

    expectObservable(e1).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should create an observable when factory throws', function () {
    var e1 = Observable.defer(function () {
      throw 'error';
    });
    var expected = '#';

    expectObservable(e1).toBe(expected);
  });

  it('should allow unsubscribing early and explicitly', function () {
    var source = hot('--a--b--c--|');
    var sourceSubs = '^     !     ';
    var expected =   '--a--b-     ';
    var unsub =      '      !     ';

    var e1 = Observable.defer(function () {
      return source;
    });

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('--a--b--c--|');
    var sourceSubs = '^     !     ';
    var expected =   '--a--b-     ';
    var unsub =      '      !     ';

    var e1 = Observable.defer(function () {
      return source.mergeMap(function (x) { return Observable.of(x); });
    })
    .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(e1, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});
