/* globals describe, it, expect, cold, hot, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.find()', function () {
  function truePredicate(x) {
    return true;
  }

  it('should throw if not provided a function', function () {
    expect(function () {
      Observable.of('yut', 'yee', 'sam').find('yee');
    }).toThrow(new TypeError('predicate is not a function'));
  });

  it('should not emit if source does not emit', function () {
    var source = hot('-');
    var subs =       '^';
    var expected =   '-';

    expectObservable(source.find(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if source is empty to match predicate', function () {
    var source = cold('|');
    var subs =        '(^!)';
    var expected =    '(x|)';

    var result = source.find(truePredicate);

    expectObservable(result).toBe(expected, {x: undefined});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return matching element from source emits single element', function () {
    var source = hot('--a--|');
    var subs =       '^ !';
    var expected =   '--(a|)';

    var predicate = function (value) {
      return value === 'a';
    };

    expectObservable(source.find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if element does not match with predicate', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^          !';
    var expected =   '-----------(x|)';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.find(predicate)).toBe(expected, { x: undefined });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^     !     ';
    var expected =   '-------     ';
    var unsub =      '      !     ';

    var result = source.find(function (value) { return value === 'z'; });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^     !     ';
    var expected =   '-------     ';
    var unsub =      '      !     ';

    var result = source
      .mergeMap(function (x) { return Observable.of(x); })
      .find(function (value) { return value === 'z'; })
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise if source raise error while element does not match with predicate', function () {
    var source = hot('--a--b--#');
    var subs =       '^       !';
    var expected =   '--------#';

    var predicate = function (value) {
      return value === 'z';
    };

    expectObservable(source.find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^ !';
    var expected =   '--#';

    var predicate = function (value) {
      throw 'error';
    };

    expectObservable(source.find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});