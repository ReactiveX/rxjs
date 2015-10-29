/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.take()', function () {
  it('should work with empty', function () {
    var e1 = Observable.empty();
    var expected = '|';
    expectObservable(e1.take(42)).toBe(expected);
  });

  it('should go on forever on never', function () {
    var e1 = Observable.never();
    var expected = '-';
    expectObservable(e1.take(42)).toBe(expected);
  });

  it('should be empty on take(0)', function () {
    var e1 = hot('--a--^--b----c---d--|');
    var expected = '|';
    expectObservable(e1.take(0)).toBe(expected);
  });

  it('should take one value of an observable with one value', function () {
    var e1 =   hot('---(a|)');
    var expected = '---(a|)';
    expectObservable(e1.take(1)).toBe(expected);
  });

  it('should take one values of an observable with many values', function () {
    var e1 = hot('--a--^--b----c---d--|');
    var expected =    '---(b|)';
    expectObservable(e1.take(1)).toBe(expected);
  });

  it('should take two values of an observable with many values', function () {
    var e1 = hot('--a--^--b----c---d--|');
    var expected =    '---b----(c|)';
    expectObservable(e1.take(2)).toBe(expected);
  });

  it('should error on empty', function () {
    var e1 = hot('--a--^----|');
    var expected =    '-----|';
    expectObservable(e1.take(42)).toBe(expected);
  });

  it('should propagate error from the source observable', function () {
    var e1 = hot('---^---#', null, 'too bad');
    var expected =  '----#';
    expectObservable(e1.take(42)).toBe(expected, null, 'too bad');
  });

  it('should propagate error from an observable with values', function () {
    var e1 = hot('---^--a--b--#');
    var expected =  '---a--b--#';
    expectObservable(e1.take(42)).toBe(expected);
  });

  it('should work with throw', function () {
    var e1 = Observable.throw(new Error('too bad'));
    var expected = '#';
    expectObservable(e1.take(42)).toBe(expected, null, new Error('too bad'));
  });

  it('should throw if total is less than zero', function () {
    expect(function () { Observable.range(0,10).take(-1); })
      .toThrow(new Rx.ArgumentOutOfRangeError());
  });
});
