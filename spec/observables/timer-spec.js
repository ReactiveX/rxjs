/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Observer = Rx.Observer;

describe('Observable.timer', function () {
  it('should schedule a value of 0 then complete', function () {
    var source = Observable.timer(50, undefined, rxTestScheduler);
    var expected = '-----(x|)';

    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should emit a single value immediately', function () {
    var source = Observable.timer(0, rxTestScheduler);
    var expected = '(x|)';

    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should start after delay and periodically emit values', function () {
    var source = Observable.timer(40, 20, rxTestScheduler).take(5);
    var expected = '----a-b-c-d-(e|)';
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};

    expectObservable(source).toBe(expected, values);
  });

  it('should start immediately and periodically emit values', function () {
    var source = Observable.timer(0, 30, rxTestScheduler).take(5);
    var expected = 'a--b--c--d--(e|)';
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};

    expectObservable(source).toBe(expected, values);
  });

  it('should stop emiting values when subscription is done', function () {
    var source = Observable.timer(0, 30, rxTestScheduler);
    var expected = 'a--b--c--d--e';
    var unsub   =  '^            !';
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};

    expectObservable(source, unsub).toBe(expected, values);
  });

  it('should schedule a value at a specified Date', function () {
    var source = Observable.timer(new Date(rxTestScheduler.now() + 40), null, rxTestScheduler);
    var expected = '----(a|)';

    expectObservable(source).toBe(expected, {a: 0});
  });

  it('should start after delay and periodically emit values', function () {
    var source = Observable.timer(new Date(rxTestScheduler.now() + 40), 20, rxTestScheduler).take(5);
    var expected = '----a-b-c-d-(e|)';
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};

    expectObservable(source).toBe(expected, values);
  });
});
