/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.sampleTime', function () {
  it.asDiagram('sampleTime(110)')('should get samples on a delay', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var e1subs =         '^                           !';
    var expected =       '-----------c----------e-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample nothing if new value has not arrived', function () {
    var e1 =   hot('----a-^--b----c--------------f----|');
    var e1subs =         '^                           !';
    var expected =       '-----------c----------------|';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample if new value has arrived, even if it is the same value', function () {
    var e1 =   hot('----a-^--b----c----------c---f----|');
    var e1subs =         '^                           !';
    var expected =       '-----------c----------c-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample nothing if source has not nexted by time of sample', function () {
    var e1 =   hot('----a-^-------------b-------------|');
    var e1subs =         '^                           !';
    var expected =       '----------------------b-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source raises error', function () {
    var e1 =   hot('----a-^--b----c----d----#');
    var e1subs =         '^                 !';
    var expected =       '-----------c------#';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var unsub =          '                !            ';
    var e1subs =         '^               !            ';
    var expected =       '-----------c-----            ';
    // timer              -----------!----------!---------

    expectObservable(e1.sampleTime(110, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var e1subs =         '^               !            ';
    // timer              -----------!----------!---------
    var expected =       '-----------c-----            ';
    var unsub =          '                !            ';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .sampleTime(110, rxTestScheduler)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes if source does not emits', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source throws immediately', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not complete', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});