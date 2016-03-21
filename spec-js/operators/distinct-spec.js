"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {distinct} */
describe('Observable.prototype.distinct', function () {
    it('should distinguish between values', function () {
        var e1 = hot('--a--a--a--b--b--a--|');
        var e1subs = '^                   !';
        var expected = '--a--------b--------|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish between values and does not completes', function () {
        var e1 = hot('--a--a--a--b--b--a-');
        var e1subs = '^                  ';
        var expected = '--a--------b-------';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source does not completes', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source does not emit', function () {
        var e1 = hot('------|');
        var e1subs = '^     !';
        var expected = '------|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source emits single element only', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = '--a--|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source is scalar', function () {
        var e1 = Observable.of('a');
        var expected = '(a|)';
        expectObservable(e1.distinct()).toBe(expected);
    });
    it('should raises error if source raises error', function () {
        var e1 = hot('--a--a--#');
        var e1subs = '^       !';
        var expected = '--a-----#';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not omit if source elements are all different', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^                   !';
        var expected = '--a--b--c--d--e--f--|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--b--b--d--a--f--|');
        var e1subs = '^         !          ';
        var expected = '--a--b-----          ';
        var unsub = '          !          ';
        var result = e1.distinct();
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var e1 = hot('--a--b--b--d--a--f--|');
        var e1subs = '^         !          ';
        var expected = '--a--b-----          ';
        var unsub = '          !          ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .distinct()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if source elements are all same', function () {
        var e1 = hot('--a--a--a--a--a--a--|');
        var e1subs = '^                   !';
        var expected = '--a-----------------|';
        expectObservable(e1.distinct()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if comparer returns true always regardless of source emits', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^                   !';
        var expected = '--a-----------------|';
        expectObservable(e1.distinct(function () { return true; })).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit all if comparer returns false always regardless of source emits', function () {
        var e1 = hot('--a--a--a--a--a--a--|');
        var e1subs = '^                   !';
        var expected = '--a--a--a--a--a--a--|';
        expectObservable(e1.distinct(function () { return false; })).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish values by selector', function () {
        var e1 = hot('--a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
        var e1subs = '^                   !';
        var expected = '--a-----c-----e-----|';
        var selector = function (x, y) { return y % 2 === 0; };
        expectObservable(e1.distinct(selector)).toBe(expected, { a: 1, c: 3, e: 5 });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error when comparer throws', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^          !         ';
        var expected = '--a--b--c--#         ';
        var selector = function (x, y) {
            if (y === 'd') {
                throw 'error';
            }
            return x === y;
        };
        expectObservable(e1.distinct(selector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should support a flushing stream', function () {
        var e1 = hot('--a--b--a--b--a--b--|');
        var e1subs = '^                   !';
        var e2 = hot('-----------x--------|');
        var e2subs = '^                   !';
        var expected = '--a--b--------a--b--|';
        var selector = function (x, y) { return x === y; };
        expectObservable(e1.distinct(selector, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if flush raises error', function () {
        var e1 = hot('--a--b--a--b--a--b--|');
        var e1subs = '^            !';
        var e2 = hot('-----------x-#');
        var e2subs = '^            !';
        var expected = '--a--b-------#';
        var selector = function (x, y) { return x === y; };
        expectObservable(e1.distinct(selector, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should unsubscribe from the flushing stream when the main stream is unsubbed', function () {
        var e1 = hot('--a--b--a--b--a--b--|');
        var e1subs = '^          !         ';
        var e2 = hot('-----------x--------|');
        var e2subs = '^          !         ';
        var unsub = '           !         ';
        var expected = '--a--b------';
        var selector = function (x, y) { return x === y; };
        expectObservable(e1.distinct(selector, e2), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow opting in to default comparator with flush', function () {
        var e1 = hot('--a--b--a--b--a--b--|');
        var e1subs = '^                   !';
        var e2 = hot('-----------x--------|');
        var e2subs = '^                   !';
        var expected = '--a--b--------a--b--|';
        expectObservable(e1.distinct(null, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
//# sourceMappingURL=distinct-spec.js.map