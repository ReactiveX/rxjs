/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('count', function () {
  it.asDiagram('count')('should count the values of an observable', function () {
    var source = hot('--a--b--c--|');
    var subs =       '^          !';
    var expected =   '-----------(x|)';

    expectObservable(source.count()).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should be never when source is never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', function () {
    var e1 = hot('--x--^--y--');
    var e1subs =      '^     ';
    var expected =    '------';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be zero when source doesn\'t have values', function () {
    var e1 = hot('-x-^---|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the unique value of an observable', function () {
    var e1 = hot('-x-^--y--|');
    var e1subs =    '^     !';
    var expected =  '------(w|)';

    expectObservable(e1.count()).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should count the values of an ongoing hot observable', function () {
    var source = hot('--a-^-b--c--d--|');
    var subs =           '^          !';
    var expected =       '-----------(x|)';

    expectObservable(source.count()).toBe(expected, {x: 3});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should count a range() source observable', function (done) {
    Rx.Observable.range(1, 10).count().subscribe(
      function (value) {
        expect(value).toEqual(10);
      },
      done.fail,
      done
    );
  });

  it('should count a range().skip(1) source observable', function (done) {
    Rx.Observable.range(1, 10).skip(1).count().subscribe(
      function (value) {
        expect(value).toEqual(9);
      },
      done.fail,
      done
    );
  });

  it('should count a range().take(1) source observable', function (done) {
    Rx.Observable.range(1, 10).take(1).count().subscribe(
      function (value) {
        expect(value).toEqual(1);
      },
      done.fail,
      done
    );
  });

  it('should work with error', function () {
    var e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    var e1subs =    '^        !';
    var expected =  '---------#';

    expectObservable(e1.count()).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.count()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on an empty hot observable', function () {
    var e1 = hot('-x-^---|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';
    var predicate = function () {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on an empty hot observable', function () {
    var e1 = hot('-x-^---|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';
    var predicate = function () {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a simple hot observable', function () {
    var e1 = hot('-x-^-a-|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';
    var predicate = function () {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 1 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on a simple hot observable', function () {
    var e1 = hot('-x-^-a-|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';
    var predicate = function () {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', function () {
    var e1 = hot('-1-^-2--3--4-|');
    var e1subs =    '^     !    ';
    var expected =  '-------    ';
    var unsub =     '      !    ';

    var result = e1.count(function (value) { return parseInt(value) < 10; });

    expectObservable(result, unsub).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 = hot('-1-^-2--3--4-|');
    var e1subs =    '^     !    ';
    var expected =  '-------    ';
    var unsub =     '      !    ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .count(function (value) { return parseInt(value) < 10; })
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-all predicate on observable with many values', function () {
    var e1 = hot('-1-^-2--3--4-|');
    var e1subs =    '^         !';
    var expected =  '----------(w|)';
    var predicate = function (value) {
      return parseInt(value) < 10;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 3 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a match-none predicate on observable with many values', function () {
    var e1 = hot('-1-^-2--3--4-|');
    var e1subs =    '^         !';
    var expected =  '----------(w|)';
    var predicate = function (value) {
      return parseInt(value) > 10;
    };

    expectObservable(e1.count(predicate)).toBe(expected, { w: 0 });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on observable that throws', function () {
    var e1 = hot('-1-^---#');
    var e1subs =    '^   !';
    var expected =  '----#';
    var predicate = function () {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-false predicate on observable that throws', function () {
    var e1 = hot('-1-^---#');
    var e1subs =    '^   !';
    var expected =  '----#';
    var predicate = function () {
      return false;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an always-true predicate on a hot never-observable', function () {
    var e1 = hot('-x-^----');
    var e1subs =    '^    ';
    var expected =  '-----';
    var predicate = function () {
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a predicate that throws, on observable with many values', function () {
    var e1 = hot('-1-^-2--3--|');
    var e1subs =    '^    !   ';
    var expected =  '-----#   ';
    var predicate = function (value) {
      if (value === '3') {
        throw 'error';
      }
      return true;
    };

    expectObservable(e1.count(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
