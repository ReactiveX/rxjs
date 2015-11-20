/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.delay()', function () {
  it.asDiagram('delay')('should delay by specified timeframe', function () {
    var e1 =   hot('--a--b--|');
    var expected = '-----a--b--|';
    var subs =     '^          !';

    expectObservable(e1.delay(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period', function () {
    var e1 =   hot('--a--b--|');
    var expected = '-----a--b--|';
    var subs =     '^          !';
    var absoluteDelay = new Date(rxTestScheduler.now() + 30);

    expectObservable(e1.delay(absoluteDelay, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period after subscription', function () {
    var e1 =   hot('---^--a--b--|');
    var expected =    '------a--b--|';
    var subs =        '^           !';
    var absoluteDelay = new Date(rxTestScheduler.now() + 30);

    expectObservable(e1.delay(absoluteDelay, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', function () {
    var e1 =   hot('---a---b---#');
    var expected = '------a---b#';
    var subs =     '^          !';

    expectObservable(e1.delay(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', function () {
    var e1 =   hot('--a--b--#');
    var expected = '-----a--#';
    var subs =     '^       !';
    var absoluteDelay = new Date(rxTestScheduler.now() + 30);

    expectObservable(e1.delay(absoluteDelay, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error after subscription', function () {
    var e1 =   hot('---^---a---b---#');
    var expected =    '-------a---b#';
    var e1Sub =       '^           !';
    var absoluteDelay = new Date(rxTestScheduler.now() + 30);

    expectObservable(e1.delay(absoluteDelay, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1Sub);
  });

  it('should delay when source does not emits', function () {
    var e1 =   hot('----|');
    var expected = '-------|';
    var subs =     '^      !';

    expectObservable(e1.delay(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay when source is empty', function () {
    var e1 = Observable.empty();
    var expected = '---|';

    expectObservable(e1.delay(30, rxTestScheduler)).toBe(expected);
  });

  it('should not complete when source does not completes', function () {
    var e1 =   hot('---a---b-');
    var expected = '------a---b-';
    var unsub =    '----------------!';
    var subs =     '^               !';

    expectObservable(e1.delay(30, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source never completes', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.delay(30, rxTestScheduler)).toBe(expected);
  });
});