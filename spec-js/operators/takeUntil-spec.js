"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {takeUntil} */
describe('Observable.prototype.takeUntil', function () {
    asDiagram('takeUntil')('should take values until notifier emits', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^            !          ';
        var e2 = hot('-------------z--|       ');
        var e2subs = '^            !          ';
        var expected = '--a--b--c--d-|          ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should take values and raises error when notifier raises error', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^            !          ';
        var e2 = hot('-------------#          ');
        var e2subs = '^            !          ';
        var expected = '--a--b--c--d-#          ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should take all values when notifier is empty', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^                      !';
        var e2 = hot('-------------|          ');
        var e2subs = '^            !          ';
        var expected = '--a--b--c--d--e--f--g--|';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should take all values when notifier does not complete', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^                      !';
        var e2 = hot('-');
        var e2subs = '^                      !';
        var expected = '--a--b--c--d--e--f--g--|';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^      !                ';
        var e2 = hot('-------------z--|       ');
        var e2subs = '^      !                ';
        var unsub = '       !                ';
        var expected = '--a--b--                ';
        expectObservable(e1.takeUntil(e2), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should complete when notifier emits if source observable does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^ !';
        var e2 = hot('--a--b--|');
        var e2subs = '^ !';
        var expected = '--|';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error when notifier raises error if source observable does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^ !';
        var e2 = hot('--#');
        var e2subs = '^ !';
        var expected = '--#';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete when notifier is empty if source observable does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var e2 = hot('--|');
        var e2subs = '^ !';
        var expected = '---';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete when source and notifier do not complete', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var e2 = hot('-');
        var e2subs = '^';
        var expected = '-';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should complete when notifier emits before source observable emits', function () {
        var e1 = hot('----a--|');
        var e1subs = '^ !     ';
        var e2 = hot('--x     ');
        var e2subs = '^ !     ';
        var expected = '--|     ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if source raises error before notifier emits', function () {
        var e1 = hot('--a--b--c--d--#     ');
        var e1subs = '^             !     ';
        var e2 = hot('----------------a--|');
        var e2subs = '^             !     ';
        var expected = '--a--b--c--d--#     ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error immediately if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var e2 = hot('--x');
        var e2subs = '(^!)';
        var expected = '#';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should dispose source observable if notifier emits before source emits', function () {
        var e1 = hot('---a---|');
        var e1subs = '^ !     ';
        var e2 = hot('--x-|   ');
        var e2subs = '^ !     ';
        var expected = '--|     ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should dispose notifier if source observable completes', function () {
        var e1 = hot('--a--|     ');
        var e1subs = '^    !     ';
        var e2 = hot('-------x--|');
        var e2subs = '^    !     ';
        var expected = '--a--|     ';
        expectObservable(e1.takeUntil(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var e1 = hot('--a--b--c--d--e--f--g--|');
        var e1subs = '^      !                ';
        var e2 = hot('-------------z--|       ');
        var e2subs = '^      !                ';
        var unsub = '       !                ';
        var expected = '--a--b--                ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .takeUntil(e2)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
//# sourceMappingURL=takeUntil-spec.js.map