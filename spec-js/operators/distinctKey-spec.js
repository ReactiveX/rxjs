"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {distinctKey} */
describe('Observable.prototype.distinctKey', function () {
    asDiagram('distinctKey(\'k\')')('should distinguish between values', function () {
        var values = { a: { k: 1 }, b: { k: 2 }, c: { k: 3 } };
        var e1 = hot('-a--b-b----a-c-|', values);
        var expected = '-a--b--------c-|';
        var result = e1.distinctKey('k');
        expectObservable(result).toBe(expected, values);
    });
    it('should distinguish between values', function () {
        var values = { a: { val: 1 }, b: { val: 2 } };
        var e1 = hot('--a--a--a--b--b--a--|', values);
        var e1subs = '^                   !';
        var expected = '--a--------b--------|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish between values and does not completes', function () {
        var values = { a: { val: 1 }, b: { val: 2 } };
        var e1 = hot('--a--a--a--b--b--a-', values);
        var e1subs = '^                  ';
        var expected = '--a--------b-------';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish between values with key', function () {
        var values = { a: { val: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { val: 1 }, e: { val: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^                !';
        var expected = '--a--b--------e--|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not compare if source does not have element with key', function () {
        var values = { a: { valOther: 1 }, b: { valOther: 1 }, c: { valOther: 3 }, d: { valOther: 1 }, e: { valOther: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^                !';
        var expected = '--a--------------|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinctKey('val')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes if source does not completes', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.distinctKey('val')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.distinctKey('val')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete if source does not emit', function () {
        var e1 = hot('------|');
        var e1subs = '^     !';
        var expected = '------|';
        expectObservable(e1.distinctKey('val')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source emits single element only', function () {
        var values = { a: { val: 1 } };
        var e1 = hot('--a--|', values);
        var e1subs = '^    !';
        var expected = '--a--|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit if source is scalar', function () {
        var values = { a: { val: 1 } };
        var e1 = Observable.of(values.a);
        var expected = '(a|)';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
    });
    it('should raises error if source raises error', function () {
        var values = { a: { val: 1 } };
        var e1 = hot('--a--a--#', values);
        var e1subs = '^       !';
        var expected = '--a-----#';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.distinctKey('val')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not omit if source elements are all different', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^                !';
        var expected = '--a--b--c--d--e--|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--b--d--a--e--|', values);
        var e1subs = '^         !          ';
        var expected = '--a--b-----          ';
        var unsub = '          !          ';
        var result = e1.distinctKey('val');
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--b--d--a--e--|', values);
        var e1subs = '^         !          ';
        var expected = '--a--b-----          ';
        var unsub = '          !          ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .distinctKey('val')
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if source elements are all same', function () {
        var values = { a: { val: 1 } };
        var e1 = hot('--a--a--a--a--a--a--|', values);
        var e1subs = '^                   !';
        var expected = '--a-----------------|';
        expectObservable(e1.distinctKey('val')).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit once if comparer returns true always regardless of source emits', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^                !';
        var expected = '--a--------------|';
        expectObservable(e1.distinctKey('val', function () { return true; })).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit all if comparer returns false always regardless of source emits', function () {
        var values = { a: { val: 1 } };
        var e1 = hot('--a--a--a--a--a--a--|', values);
        var e1subs = '^                   !';
        var expected = '--a--a--a--a--a--a--|';
        expectObservable(e1.distinctKey('val', function () { return false; })).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should distinguish values by selector', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^                !';
        var expected = '--a-----c-----e--|';
        var selector = function (x, y) { return y % 2 === 0; };
        expectObservable(e1.distinctKey('val', selector)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raises error when comparer throws', function () {
        var values = { a: { val: 1 }, b: { val: 2 }, c: { val: 3 }, d: { val: 4 }, e: { val: 5 } };
        var e1 = hot('--a--b--c--d--e--|', values);
        var e1subs = '^          !      ';
        var expected = '--a--b--c--#      ';
        var selector = function (x, y) {
            if (y === 4) {
                throw 'error';
            }
            return x === y;
        };
        expectObservable(e1.distinctKey('val', selector)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=distinctKey-spec.js.map