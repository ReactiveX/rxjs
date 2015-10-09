/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.reduce()', function () {
  it('should reduce', function () {
    var e1 =     hot('--a--b--c--|');
    var expected =   '-----------(x|)';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, '')).toBe(expected, {x: 'abc'});
  });

  it('should reduce with seed', function () {
    var e1 =     hot('--a--b--|');
    var expected =   '--------(x|)';

    var seed = 'n';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected, {x: seed + 'ab'});
  });

  it('should reduce with seed if source is empty', function () {
    var e1 = hot('--a--^-------|');
    var expected =    '--------(x|)';

    var expectedValue = '42';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected, {x: expectedValue});
  });

  it('should raise error if reduce function throws without seed', function () {
    var e1 =     hot('--a--b--|');
    var expected =   '-----#';

    var reduceFunction = function (o, x) {
      throw 'error';
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });

  it('should raise error if source emits and raises error with seed', function () {
    var e1 =   hot('--a--b--#');
    var expected = '--------#';

    var expectedValue = '42';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected);
  });

  it('should raise error if source raises error with seed', function () {
    var e1 =   hot('----#');
    var expected = '----#';

    var expectedValue = '42';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected);
  });

  it('should raise error if reduce function throws with seed', function () {
    var e1 =     hot('--a--b--|');
    var expected =   '--#';

    var seed = 'n';
    var reduceFunction = function (o, x) {
      throw 'error';
    };

    expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
  });

  it('should not complete with seed if source emits but does not completes', function () {
    var e1 =     hot('--a--');
    var expected =   '-';

    var seed = 'n';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
  });

  it('should not complete with seed if source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    var seed = 'n';
    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
  });

  it('should not complete without seed if source emits but does not completes', function () {
    var e1 =   hot('--a--b--');
    var expected = '-';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });

  it('should not complete without seed if source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });

  it('should reduce if source does not emit without seed', function () {
    var e1 = hot('--a--^-------|');
    var expected =    '--------|';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });

  it('should raise error if source emits and raises error without seed', function () {
    var e1 =   hot('--a--b--#');
    var expected = '--------#';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });

  it('should raise error if source raises error without seed', function () {
    var e1 =   hot('----#');
    var expected = '----#';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(e1.reduce(reduceFunction)).toBe(expected);
  });
});