/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mergeScan()', function () {
  it('should mergeScan things', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                    !';
    var expected =    '---u--v--w--x--y--z--|';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors', function () {
    var e1 = hot('--a--^--b--c--d--#');
    var e1subs =      '^           !';
    var expected =    '---u--v--w--#';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd']
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeScan values and be able to asynchronously project them', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                    !';
    var expected =    '-----u--v--w--x--y--z|';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.mergeScan(function (acc, x) {
      return Observable.of(acc.concat(x)).delay(20, rxTestScheduler);
    }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not stop ongoing async projections when source completes', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                      !';
    var expected =    '--------u--v--w--x--y--(z|)';

    var values = {
      u: ['b'],
      v: ['c'],
      w: ['b', 'd'],
      x: ['c', 'e'],
      y: ['b', 'd', 'f'],
      z: ['c', 'e', 'g'],
    };

    var source = e1.mergeScan(function (acc, x) {
      return Observable.of(acc.concat(x)).delay(50, rxTestScheduler);
    }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should interrupt ongoing async projections when result is unsubscribed early', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^               !     ';
    var expected =    '--------u--v--w--     ';

    var values = {
      u: ['b'],
      v: ['c'],
      w: ['b', 'd'],
      x: ['c', 'e'],
      y: ['b', 'd', 'f'],
      z: ['c', 'e', 'g'],
    };

    var source = e1.mergeScan(function (acc, x) {
      return Observable.of(acc.concat(x)).delay(50, rxTestScheduler);
    }, []);

    expectObservable(source, e1subs).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors in the projection function', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^        !';
    var expected =    '---u--v--#';

    var values = {
      u: ['b'],
      v: ['b', 'c']
    };

    var source = e1.mergeScan(function (acc, x) {
      if (x === 'd') {
        throw 'bad!';
      }
      return Observable.of(acc.concat(x));
    }, []);

    expectObservable(source).toBe(expected, values, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should propagate errors from the projected Observable', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^  !';
    var expected =    '---#';

    var source = e1.mergeScan(function (acc, x) {
      return Observable.throw('bad!');
    }, []);

    expectObservable(source).toBe(expected, undefined, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle an empty projected Observable', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                    !';
    var expected =    '---------------------(x|)';

    var values = { x: [] };

    var source = e1.mergeScan(function (acc, x) {
      return Observable.empty();
    }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a never projected Observable', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                     ';
    var expected =    '----------------------';

    var values = { x: [] };

    var source = e1.mergeScan(function (acc, x) {
      return Observable.never();
    }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(u|)';

    var values = {
      u: []
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeScan unsubscription', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var expected =    '---u--v--w--x--';
    var sub =         '^             !';
    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source, sub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
