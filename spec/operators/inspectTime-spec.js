/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.inspectTime', function () {
  it('should get inspections on a delay', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var e1subs =         '^                           !';
    var expected =       '-----------c----------e-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.inspectTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should inspect nothing if source has not nexted by time of inspect', function () {
    var e1 =   hot('----a-^-------------b-------------|');
    var e1subs =         '^                           !';
    var expected =       '----------------------b-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.inspectTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source raises error', function () {
    var e1 =   hot('----a-^--b----c----d----#');
    var e1subs =         '^                 !';
    var expected =       '-----------c------#';
    // timer              -----------!----------!---------

    expectObservable(e1.inspectTime(110, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =   hot('----a-^--b----c----d----e----f----|');
    var unsub =          '                !            ';
    var e1subs =         '^               !            ';
    var expected =       '-----------c-----            ';
    // timer              -----------!----------!---------

    expectObservable(e1.inspectTime(110, rxTestScheduler), unsub).toBe(expected);
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
      .inspectTime(110, rxTestScheduler)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes if source does not emits', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.inspectTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source throws immediately', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.inspectTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not complete', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.inspectTime(60, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});