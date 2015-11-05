/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.first()', function () {
  it('should take the first value of an observable with one value', function () {
    var e1 =   hot('---(a|)');
    var expected = '---(a|)';
    var sub =      '^  !';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should take the first value of an observable with many values', function () {
    var e1 = hot('--a--^--b----c---d--|');
    var expected =    '---(b|)';
    var sub =         '^  !';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should error on empty', function () {
    var e1 = hot('--a--^----|');
    var expected =    '-----#';
    var sub =         '^    !';

    expectObservable(e1.first()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return the default value if source observable was empty', function () {
    var e1 = hot('-----^----|');
    var expected =    '-----(a|)';
    var sub =         '^    !';

    expectObservable(e1.first(null, null, 'a')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should propagate error from the source observable', function () {
    var e1 = hot('---^---#');
    var expected =  '----#';
    var sub =       '^   !';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should go on forever on never', function () {
    var e1 = hot('--^-------');
    var expected = '--------';
    var sub =      '^       ';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return first value that matches a predicate', function () {
    var e1 = hot('--a-^--b--c--a--c--|');
    var expected =   '------(c|)';
    var sub =        '^     !';
    var predicate = function (value) {
      return value === 'c';
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return first value that matches a predicate for odd numbers', function () {
    var e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
    var expected =   '------(c|)';
    var sub =        '^     !';
    var predicate = function (value) {
      return value % 2 === 1;
    };

    expectObservable(e1.first(predicate)).toBe(expected, {c: 3});
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should error when no value matches the predicate', function () {
    var e1 = hot('--a-^--b--c--a--c--|');
    var expected =   '---------------#';
    var sub =        '^              !';
    var predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate)).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return the default value when no value matches the predicate', function () {
    var e1 = hot('--a-^--b--c--a--c--|');
    var expected =   '---------------(d|)';
    var sub =        '^              !';
    var predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate, null, 'd')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should propagate error when no value matches the predicate', function () {
    var e1 = hot('--a-^--b--c--a--#');
    var expected =   '------------#';
    var sub =        '^           !';
    var predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return first value that matches the index in the predicate', function () {
    var e1 = hot('--a-^--b--c--a--c--|');
    var expected =   '---------(a|)';
    var sub =        '^        !';
    var predicate = function (value, index) {
      return index === 2;
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should propagate error from predicate', function () {
    var e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
    var expected =   '---------#';
    var sub =        '^        !';
    var predicate = function (value) {
      if (value < 4) {
        return false;
      } else {
        throw 'error';
      }
    };

    expectObservable(e1.first(predicate)).toBe(expected, null, 'error');
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should support a result selector argument', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var expected =    '--------(x|)';
    var sub =         '^       !';
    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      expect(i).toBe(1);
      expect(x).toBe('c');
      return 'x';
    };

    expectObservable(e1.first(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should raise error when result selector throws', function () {
    var e1 = hot('--a--^---b---c---d---e--|');
    var expected =    '--------#';
    var sub =         '^       !';
    var predicate = function (x) { return x === 'c'; };
    var resultSelector = function (x, i) {
      throw 'error';
    };

    expectObservable(e1.first(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
