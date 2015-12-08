/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.last()', function () {
  it('should take the last value of an observable', function () {
    var e1 = hot('--a--^--b--c--|');
    var e1subs =      '^        !';
    var expected =    '---------(c|)';

    expectObservable(e1.last()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on nothing sent but completed', function () {
    var e1 = hot('--a--^----|');
    var e1subs =      '^    !';
    var expected =    '-----#';

    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.last()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return last element matches with predicate', function () {
    var e1 =    hot('--a--b--a--b--|');
    var e1subs =    '^             !';
    var expected =  '--------------(b|)';

    var predicate = function (value) {
      return value === 'b';
    };

    expectObservable(e1.last(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =    hot('--a--b--c--d--|');
    var unsub =     '       !       ';
    var e1subs =    '^      !       ';
    var expected =  '--------       ';

    expectObservable(e1.last(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =    hot('--a--b--c--d--|');
    var e1subs =    '^      !       ';
    var expected =  '--------       ';
    var unsub =     '       !       ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .last()
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return a default value if no element found', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(a|)';

    expectObservable(e1.last(null, null, 'a')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not return default value if an element is found', function () {
    var e1 = hot('--a---^---b---c---d---|');
    var e1subs =       '^               !';
    var expected =     '----------------(d|)';

    expectObservable(e1.last(null, null, 'x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support a result selector argument', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var e1subs =      '^                  !';
    var expected =    '-------------------(x|)';

    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      expect(i).toBe(1);
      expect(x).toBe('c');
      return 'x';
    };

    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when predicate throws', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var e1subs =      '^       !           ';
    var expected =    '--------#           ';

    var predicate = function (x) {
      if (x === 'c') {
        throw 'error';
      } else {
        return false;
      }
    };

    expectObservable(e1.last(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when result selector throws', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var e1subs =      '^       !           ';
    var expected =    '--------#           ';

    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      throw 'error';
    };

    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});