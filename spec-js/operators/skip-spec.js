"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {skip} */
describe('Observable.prototype.skip', function () {
    asDiagram('skip(3)')('should skip values before a total', function () {
        var source = hot('--a--b--c--d--e--|');
        var subs = '^                !';
        var expected = '-----------d--e--|';
        expectObservable(source.skip(3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should skip all values without error if total is more than actual number of values', function () {
        var source = hot('--a--b--c--d--e--|');
        var subs = '^                !';
        var expected = '-----------------|';
        expectObservable(source.skip(6)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should skip all values without error if total is same as actual number of values', function () {
        var source = hot('--a--b--c--d--e--|');
        var subs = '^                !';
        var expected = '-----------------|';
        expectObservable(source.skip(5)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not skip if count is zero', function () {
        var source = hot('--a--b--c--d--e--|');
        var subs = '^                !';
        var expected = '--a--b--c--d--e--|';
        expectObservable(source.skip(0)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var source = hot('--a--b--c--d--e--|');
        var unsub = '          !       ';
        var subs = '^         !       ';
        var expected = '--------c--       ';
        expectObservable(source.skip(2), unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var source = hot('--a--b--c--d--e--|');
        var subs = '^         !       ';
        var expected = '--------c--       ';
        var unsub = '          !       ';
        var result = source
            .mergeMap(function (x) { return Observable.of(x); })
            .skip(2)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise error if skip count is more than actual number of emits and source raises error', function () {
        var source = hot('--a--b--c--d--#');
        var subs = '^             !';
        var expected = '--------------#';
        expectObservable(source.skip(6)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise error if skip count is same as emits of source and source raises error', function () {
        var source = hot('--a--b--c--d--#');
        var subs = '^             !';
        var expected = '--------------#';
        expectObservable(source.skip(4)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should skip values before a total and raises error if source raises error', function () {
        var source = hot('--a--b--c--d--#');
        var subs = '^             !';
        var expected = '-----------d--#';
        expectObservable(source.skip(3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should complete regardless of skip count if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.skip(3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete if source never completes without emit', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.skip(3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip values before total and never completes if source emits and does not complete', function () {
        var e1 = hot('--a--b--c-');
        var e1subs = '^         ';
        var expected = '-----b--c-';
        expectObservable(e1.skip(1)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip all values and never completes if total is more than numbers of value and source does not complete', function () {
        var e1 = hot('--a--b--c-');
        var e1subs = '^         ';
        var expected = '----------';
        expectObservable(e1.skip(6)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip all values and never completes if total is same asnumbers of value and source does not complete', function () {
        var e1 = hot('--a--b--c-');
        var e1subs = '^         ';
        var expected = '----------';
        expectObservable(e1.skip(3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.skip(3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=skip-spec.js.map