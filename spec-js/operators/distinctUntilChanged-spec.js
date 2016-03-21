"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {distinctUntilChanged} */
describe('Observable.prototype.distinctUntilChanged', function () {
    asDiagram('distinctUntilChanged')('should distinguish between values', function () {
        var e1 = hot('-1--2-2----1-3-|');
        var expected = '-1--2------1-3-|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
    });
    it('should distinguish between values', function () {
        var e1 = hot('--a--a--a--b--b--a--|');
        var e1subs = '^                   !';
        var expected = '--a--------b-----a--|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish between values and does not completes', function () {
        var e1 = hot('--a--a--a--b--b--a-');
        var e1subs = '^                  ';
        var expected = '--a--------b-----a-';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source does not completes', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source does not emit', function () {
        var e1 = hot('------|');
        var e1subs = '^     !';
        var expected = '------|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source emits single element only', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = '--a--|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source is scalar', function () {
        var e1 = Observable.of('a');
        var expected = '(a|)';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
    });
    it('should raises error if source raises error', function () {
        var e1 = hot('--a--a--#');
        var e1subs = '^       !';
        var expected = '--a-----#';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not omit if source elements are all different', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^                   !';
        var expected = '--a--b--c--d--e--f--|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--b--b--d--a--f--|');
        var e1subs = '^         !          ';
        var expected = '--a--b-----          ';
        var unsub = '          !          ';
        var result = e1.distinctUntilChanged();
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
            .distinctUntilChanged()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if source elements are all same', function () {
        var e1 = hot('--a--a--a--a--a--a--|');
        var e1subs = '^                   !';
        var expected = '--a-----------------|';
        expectObservable(e1.distinctUntilChanged()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if comparator returns true always regardless of source emits', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^                   !';
        var expected = '--a-----------------|';
        expectObservable(e1.distinctUntilChanged(function () { return true; })).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit all if comparator returns false always regardless of source emits', function () {
        var e1 = hot('--a--a--a--a--a--a--|');
        var e1subs = '^                   !';
        var expected = '--a--a--a--a--a--a--|';
        expectObservable(e1.distinctUntilChanged(function () { return false; })).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish values by comparator', function () {
        var e1 = hot('--a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
        var e1subs = '^                   !';
        var expected = '--a-----c-----e-----|';
        var comparator = function (x, y) { return y % 2 === 0; };
        expectObservable(e1.distinctUntilChanged(comparator)).toBe(expected, { a: 1, c: 3, e: 5 });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error when comparator throws', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^          !         ';
        var expected = '--a--b--c--#         ';
        var comparator = function (x, y) {
            if (y === 'd') {
                throw 'error';
            }
            return x === y;
        };
        expectObservable(e1.distinctUntilChanged(comparator)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should use the keySelector to pick comparator values', function () {
        var e1 = hot('--a--b--c--d--e--f--|', { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
        var e1subs = '^                   !';
        var expected = '--a--b-----d-----f--|';
        var comparator = function (x, y) { return y % 2 === 1; };
        var keySelector = function (x) { return x % 2; };
        expectObservable(e1.distinctUntilChanged(comparator, keySelector)).toBe(expected, { a: 1, b: 2, d: 4, f: 6 });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error when keySelector throws', function () {
        var e1 = hot('--a--b--c--d--e--f--|');
        var e1subs = '^          !         ';
        var expected = '--a--b--c--#         ';
        var keySelector = function (x) {
            if (x === 'd') {
                throw 'error';
            }
            return x;
        };
        expectObservable(e1.distinctUntilChanged(null, keySelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=distinctUntilChanged-spec.js.map