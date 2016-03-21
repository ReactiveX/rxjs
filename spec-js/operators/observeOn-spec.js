"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {observeOn} */
describe('Observable.prototype.observeOn', function () {
    asDiagram('observeOn(scheduler)')('should observe on specified scheduler', function () {
        var e1 = hot('--a--b--|');
        var expected = '--a--b--|';
        var sub = '^       !';
        expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should observe after specified delay', function () {
        var e1 = hot('--a--b--|');
        var expected = '-----a--b--|';
        var sub = '^          !';
        expectObservable(e1.observeOn(rxTestScheduler, 30)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should observe when source raises error', function () {
        var e1 = hot('--a--#');
        var expected = '--a--#';
        var sub = '^    !';
        expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should observe when source is empty', function () {
        var e1 = hot('-----|');
        var expected = '-----|';
        var sub = '^    !';
        expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should observe when source does not complete', function () {
        var e1 = hot('-----');
        var expected = '-----';
        var sub = '^    ';
        expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--b--|');
        var sub = '^   !    ';
        var expected = '--a--    ';
        var unsub = '    !    ';
        var result = e1.observeOn(rxTestScheduler);
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
            .observeOn(rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
});
//# sourceMappingURL=observeOn-spec.js.map