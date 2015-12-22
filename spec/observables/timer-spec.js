/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Observer = Rx.Observer;

describe('Observable.timer', function () {
  it('should schedule a value of 0 then complete', function () {
    var dueTime = time('-----|');
    var expected =     '-----(x|)';

    var source = Observable.timer(dueTime, undefined, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should emit a single value immediately', function () {
    var dueTime = time('|');
    var expected =     '(x|)';

    var source = Observable.timer(dueTime, rxTestScheduler);
    expectObservable(source).toBe(expected, {x: 0});
  });

  it('should start after delay and periodically emit values', function () {
    var dueTime = time('----|');
    var period  = time(    '--|');
    var expected =     '----a-b-c-d-(e|)';

    var source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should start immediately and periodically emit values', function () {
    var dueTime = time('|');
    var period  = time('---|');
    var expected =     'a--b--c--d--(e|)';

    var source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });

  it('should stop emiting values when subscription is done', function () {
    var dueTime = time('|');
    var period  = time('---|');
    var expected = 'a--b--c--d--e';
    var unsub   =  '^            !';

    var source = Observable.timer(dueTime, period, rxTestScheduler);
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source, unsub).toBe(expected, values);
  });

  it('should schedule a value at a specified Date', function () {
    var offset = time('----|');
    var expected =    '----(a|)';

    var dueTime = new Date(rxTestScheduler.now() + offset);
    var source = Observable.timer(dueTime, null, rxTestScheduler);
    expectObservable(source).toBe(expected, {a: 0});
  });

  it('should start after delay and periodically emit values', function () {
    var offset = time('----|');
    var period = time(    '--|');
    var expected =    '----a-b-c-d-(e|)';

    var dueTime = new Date(rxTestScheduler.now() + offset);
    var source = Observable.timer(dueTime, period, rxTestScheduler).take(5);
    var values = { a: 0, b: 1, c: 2, d: 3, e: 4};
    expectObservable(source).toBe(expected, values);
  });
});
