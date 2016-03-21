"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {subscribeOn} */
describe('Observable.prototype.subscribeOn', function () {
    asDiagram('subscribeOn(scheduler)')('should subscribe on specified scheduler', function () {
        var e1 = hot('--a--b--|');
        var expected = '--a--b--|';
        var sub = '^       !';
        expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should start subscribe after specified delay', function () {
        var e1 = hot('--a--b--|');
        var expected = '-----b--|';
        var sub = '   ^    !';
        expectObservable(e1.subscribeOn(rxTestScheduler, 30)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should subscribe when source raises error', function () {
        var e1 = hot('--a--#');
        var expected = '--a--#';
        var sub = '^    !';
        expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should subscribe when source is empty', function () {
        var e1 = hot('----|');
        var expected = '----|';
        var sub = '^   !';
        expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should subscribe when source does not complete', function () {
        var e1 = hot('----');
        var expected = '----';
        var sub = '^   ';
        expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--b--|');
        var sub = '^   !    ';
        var expected = '--a--    ';
        var unsub = '    !    ';
        var result = e1.subscribeOn(rxTestScheduler);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should not break unsubscription chains when the result is unsubscribed explicitly', function () {
        var e1 = hot('--a--b--|');
        var sub = '^   !    ';
        var expected = '--a--    ';
        var unsub = '    !    ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .subscribeOn(rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
});
//# sourceMappingURL=subscribeOn-spec.js.map