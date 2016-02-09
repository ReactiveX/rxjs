/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');

var asap = Rx.Scheduler.asap;
var Observable = Rx.Observable;

describe('Observable.prototype.cache', function () {
  it('should replay values upon subscription', function () {
    var s1 = hot('---^---a---b---c---|     ').cache();
    var expected1 = '----a---b---c---|     ';
    var expected2 = '                (abc|)';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should replay values and error', function () {
    var s1 = hot('---^---a---b---c---#     ').cache();
    var expected1 = '----a---b---c---#     ';
    var expected2 = '                (abc#)';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should replay values and and share', function () {
    var s1 = hot('---^---a---b---c------------d--e--f-|').cache();
    var expected1 = '----a---b---c------------d--e--f-|';
    var expected2 = '                (abc)----d--e--f-|';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should have a bufferCount that limits the replay test 1', function () {
    var s1 = hot('---^---a---b---c------------d--e--f-|').cache(1);
    var expected1 = '----a---b---c------------d--e--f-|';
    var expected2 = '                c--------d--e--f-|';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should have a bufferCount that limits the replay test 2', function () {
    var s1 = hot('---^---a---b---c------------d--e--f-|').cache(2);
    var expected1 = '----a---b---c------------d--e--f-|';
    var expected2 = '                (bc)-----d--e--f-|';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should accept a windowTime that limits the replay', function () {
    var w = time(         '----------|');
    var s1 = hot('---^---a---b---c------------d--e--f-|').cache(Number.POSITIVE_INFINITY, w, rxTestScheduler);
    var expected1 = '----a---b---c------------d--e--f-|';
    var expected2 = '                (bc)-----d--e--f-|';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle empty', function () {
    var s1 =   cold('|').cache();
    var expected1 = '|';
    var expected2 = '                |';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle throw', function () {
    var s1 =   cold('#').cache();
    var expected1 = '#';
    var expected2 = '                #';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });

  it('should handle never', function () {
    var s1 =   cold('-').cache();
    var expected1 = '-';
    var expected2 = '                -';
    var t = time(   '----------------|');

    expectObservable(s1).toBe(expected1);

    rxTestScheduler.schedule(function () {
      expectObservable(s1).toBe(expected2);
    }, t);
  });
});