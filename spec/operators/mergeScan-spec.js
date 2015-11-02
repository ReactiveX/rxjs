/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mergeScan()', function () {
  it('should mergeScan things', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
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
  });

  it('should handle errors', function () {
    var e1 = hot('--a--^--b--c--d--#');
    var expected =    '---u--v--w--#';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd']
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, values);
  });

  it('should handle errors in the projection function', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
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
  });

  it('handle empty', function () {
    var e1 = Observable.empty();
    var expected = '(u|)';

    var values = {
        u: []
    };

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, values);
  });

  it('handle never', function () {
    var e1 = Observable.never();
    var expected = '-';

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected);
  });

  it('handle throw', function () {
    var e1 = Observable.throw('bad!');
    var expected = '#';

    var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);

    expectObservable(source).toBe(expected, undefined, 'bad!');
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
  });
});
