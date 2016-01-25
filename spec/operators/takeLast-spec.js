/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.takeLast()', function () {
  it.asDiagram('takeLast(2)')('should take two values of an observable with many values', function () {
    var e1 =  cold('--a-----b----c---d--|    ');
    var e1subs =   '^                   !    ';
    var expected = '--------------------(cd|)';

    expectObservable(e1.takeLast(2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be empty on takeLast(0)', function () {
    var e1 = hot('--a--^--b----c---d--|');
    var e1subs = []; // Don't subscribe at all
    var expected =    '|';

    expectObservable(e1.takeLast(0)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take one value from an observable with one value', function () {
    var e1 =   hot('---(a|)');
    var e1subs =   '^  !   ';
    var expected = '---(a|)';

    expectObservable(e1.takeLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take one value from an observable with many values', function () {
    var e1 = hot('--a--^--b----c---d--|   ');
    var e1subs =      '^              !   ';
    var expected =    '---------------(d|)';

    expectObservable(e1.takeLast(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on empty', function () {
    var e1 = hot('--a--^----|');
    var e1subs =      '^    !';
    var expected =    '-----|';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from the source observable', function () {
    var e1 = hot('---^---#', null, 'too bad');
    var e1subs =    '^   !';
    var expected =  '----#';

    expectObservable(e1.takeLast(42)).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate error from an observable with values', function () {
    var e1 = hot('---^--a--b--#');
    var e1subs =    '^        !';
    var expected =  '---------#';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 = hot('---^--a--b-----c--d--e--|');
    var unsub =     '         !            ';
    var e1subs =    '^        !            ';
    var expected =  '----------            ';

    expectObservable(e1.takeLast(42), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.takeLast(42)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should throw if total is less than zero', function () {
    expect(function () { Observable.range(0,10).takeLast(-1); })
      .toThrow(new Rx.ArgumentOutOfRangeError());
  });

  it('should not break unsubscription chain when unsubscribed explicitly', function () {
    var e1 = hot('---^--a--b-----c--d--e--|');
    var unsub =     '         !            ';
    var e1subs =    '^        !            ';
    var expected =  '----------            ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .takeLast(42)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
