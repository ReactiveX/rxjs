"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {delay} */
describe('Observable.prototype.delay', function () {
    asDiagram('delay(20)')('should delay by specified timeframe', function () {
        var e1 = hot('---a--b--|  ');
        var t = time('--|      ');
        var expected = '-----a--b--|';
        var subs = '^          !';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should delay by absolute time period', function () {
        var e1 = hot('--a--b--|  ');
        var t = time('---|     ');
        var expected = '-----a--b--|';
        var subs = '^          !';
        var absoluteDelay = new Date(rxTestScheduler.now() + t);
        var result = e1.delay(absoluteDelay, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should delay by absolute time period after subscription', function () {
        var e1 = hot('---^--a--b--|  ');
        var t = time('---|     ');
        var expected = '------a--b--|';
        var subs = '^           !';
        var absoluteDelay = new Date(rxTestScheduler.now() + t);
        var result = e1.delay(absoluteDelay, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should raise error when source raises error', function () {
        var e1 = hot('---a---b---#');
        var t = time('---|     ');
        var expected = '------a---b#';
        var subs = '^          !';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should raise error when source raises error', function () {
        var e1 = hot('--a--b--#');
        var t = time('---|   ');
        var expected = '-----a--#';
        var subs = '^       !';
        var absoluteDelay = new Date(rxTestScheduler.now() + t);
        var result = e1.delay(absoluteDelay, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should raise error when source raises error after subscription', function () {
        var e1 = hot('---^---a---b---#');
        var t = time('---|     ');
        var expected = '-------a---b#';
        var e1Sub = '^           !';
        var absoluteDelay = new Date(rxTestScheduler.now() + t);
        var result = e1.delay(absoluteDelay, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1Sub);
    });
    it('should delay when source does not emits', function () {
        var e1 = hot('----|   ');
        var t = time('---|');
        var expected = '-------|';
        var subs = '^      !';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should delay when source is empty', function () {
        var e1 = cold('|');
        var t = time('---|');
        var expected = '---|';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result).toBe(expected);
    });
    it('should not complete when source does not completes', function () {
        var e1 = hot('---a---b---------');
        var t = time('---|          ');
        var expected = '------a---b------';
        var unsub = '----------------!';
        var subs = '^               !';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('---a---b----');
        var t = time('---|     ');
        var e1subs = '^       !   ';
        var expected = '------a--   ';
        var unsub = '        !   ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .delay(t, rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete when source never completes', function () {
        var e1 = cold('-');
        var t = time('---|');
        var expected = '-';
        var result = e1.delay(t, rxTestScheduler);
        expectObservable(result).toBe(expected);
    });
});
//# sourceMappingURL=delay-spec.js.map