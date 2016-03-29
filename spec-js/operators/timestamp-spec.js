"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {timestamp} */
describe('Observable.prototype.timestamp', function () {
    asDiagram('timestamp')('should record the time stamp per each source elements', function () {
        var e1 = hot('-b-c-----d--e--|');
        var e1subs = '^              !';
        var expected = '-w-x-----y--z--|';
        var expectedValue = { w: 10, x: 30, y: 90, z: 120 };
        var result = e1.timestamp(rxTestScheduler)
            .map(function (x) { return x.timestamp; });
        expectObservable(result).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record stamp if source emit elements', function () {
        var e1 = hot('--a--^b--c----d---e--|');
        var e1subs = '^               !';
        var expected = '-w--x----y---z--|';
        var expectedValue = {
            w: new Rx.Timestamp('b', 10),
            x: new Rx.Timestamp('c', 40),
            y: new Rx.Timestamp('d', 90),
            z: new Rx.Timestamp('e', 130)
        };
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should completes without record stamp if source does not emits', function () {
        var e1 = hot('---------|');
        var e1subs = '^        !';
        var expected = '---------|';
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete immediately if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record stamp then does not completes if source emits but not completes', function () {
        var e1 = hot('-a--b--');
        var e1subs = '^      ';
        var expected = '-y--z--';
        var expectedValue = {
            y: new Rx.Timestamp('a', 10),
            z: new Rx.Timestamp('b', 40)
        };
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('-a--b-----c---d---|');
        var unsub = '       !           ';
        var e1subs = '^      !           ';
        var expected = '-y--z---           ';
        var expectedValue = {
            y: new Rx.Timestamp('a', 10),
            z: new Rx.Timestamp('b', 40)
        };
        var result = e1.timestamp(rxTestScheduler);
        expectObservable(result, unsub).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('-a--b-----c---d---|');
        var e1subs = '^      !           ';
        var expected = '-y--z---           ';
        var unsub = '       !           ';
        var expectedValue = {
            y: new Rx.Timestamp('a', 10),
            z: new Rx.Timestamp('b', 40)
        };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .timestamp(rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('raise error if source raises error', function () {
        var e1 = hot('---#');
        var e1subs = '^  !';
        var expected = '---#';
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record stamp then raise error if source raises error after emit', function () {
        var e1 = hot('-a--b--#');
        var e1subs = '^      !';
        var expected = '-y--z--#';
        var expectedValue = {
            y: new Rx.Timestamp('a', 10),
            z: new Rx.Timestamp('b', 40)
        };
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source immediately throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.timestamp(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=timestamp-spec.js.map