"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {timeInterval} */
describe('Observable.prototype.timeInterval', function () {
    asDiagram('timeInterval')('should record the time interval between source elements', function () {
        var e1 = hot('--a--^b-c-----d--e--|');
        var e1subs = '^              !';
        var expected = '-w-x-----y--z--|';
        var expectedValue = { w: 10, x: 20, y: 60, z: 30 };
        var result = e1.timeInterval(rxTestScheduler)
            .map(function (x) { return x.interval; });
        expectObservable(result).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record interval if source emit elements', function () {
        var e1 = hot('--a--^b--c----d---e--|');
        var e1subs = '^               !';
        var expected = '-w--x----y---z--|';
        var expectedValue = {
            w: new Rx.TimeInterval('b', 10),
            x: new Rx.TimeInterval('c', 30),
            y: new Rx.TimeInterval('d', 50),
            z: new Rx.TimeInterval('e', 40)
        };
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should completes without record interval if source does not emits', function () {
        var e1 = hot('---------|');
        var e1subs = '^        !';
        var expected = '---------|';
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete immediately if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record interval then does not completes if source emits but not completes', function () {
        var e1 = hot('-a--b--');
        var e1subs = '^      ';
        var expected = '-y--z--';
        var expectedValue = {
            y: new Rx.TimeInterval('a', 10),
            z: new Rx.TimeInterval('b', 30)
        };
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('-a--b-----c---d---|');
        var unsub = '       !           ';
        var e1subs = '^      !           ';
        var expected = '-y--z---           ';
        var expectedValue = {
            y: new Rx.TimeInterval('a', 10),
            z: new Rx.TimeInterval('b', 30)
        };
        var result = e1.timeInterval(rxTestScheduler);
        expectObservable(result, unsub).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('-a--b-----c---d---|');
        var e1subs = '^      !           ';
        var expected = '-y--z---           ';
        var unsub = '       !           ';
        var expectedValue = {
            y: new Rx.TimeInterval('a', 10),
            z: new Rx.TimeInterval('b', 30)
        };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .timeInterval(rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('raise error if source raises error', function () {
        var e1 = hot('---#');
        var e1subs = '^  !';
        var expected = '---#';
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should record interval then raise error if source raises error after emit', function () {
        var e1 = hot('-a--b--#');
        var e1subs = '^      !';
        var expected = '-y--z--#';
        var expectedValue = {
            y: new Rx.TimeInterval('a', 10),
            z: new Rx.TimeInterval('b', 30)
        };
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected, expectedValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source immediately throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.timeInterval(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=timeInterval-spec.js.map