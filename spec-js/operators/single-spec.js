"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {single} */
describe('Observable.prototype.single', function () {
    asDiagram('single')('should raise error from empty predicate if observable emits multiple time', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^    !      ';
        var expected = '-----#      ';
        var errorMsg = 'Sequence contains more than one element';
        expectObservable(e1.single()).toBe(expected, null, errorMsg);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error from empty predicate if observable does not emit', function () {
        var e1 = hot('--a--^--|');
        var e1subs = '^  !';
        var expected = '---#';
        expectObservable(e1.single()).toBe(expected, null, new Rx.EmptyError());
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return only element from empty predicate if observable emits only once', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = '-----(a|)';
        expectObservable(e1.single()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--b--c--|');
        var unsub = '   !        ';
        var e1subs = '^  !        ';
        var expected = '----        ';
        expectObservable(e1.single(), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^  !        ';
        var expected = '----        ';
        var unsub = '   !        ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .single()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error from empty predicate if observable emits error', function () {
        var e1 = hot('--a--b^--#');
        var e1subs = '^  !';
        var expected = '---#';
        expectObservable(e1.single()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error from predicate if observable emits error', function () {
        var e1 = hot('--a--b^--#');
        var e1subs = '^  !';
        var expected = '---#';
        var predicate = function (value) {
            return value === 'c';
        };
        expectObservable(e1.single(predicate)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if predicate throws error', function () {
        var e1 = hot('--a--b--c--d--|');
        var e1subs = '^          !   ';
        var expected = '-----------#   ';
        var predicate = function (value) {
            if (value !== 'd') {
                return false;
            }
            throw 'error';
        };
        expectObservable(e1.single(predicate)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return element from predicate if observable have single matching element', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^          !';
        var expected = '-----------(b|)';
        var predicate = function (value) {
            return value === 'b';
        };
        expectObservable(e1.single(predicate)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error from predicate if observable have multiple matching element', function () {
        var e1 = hot('--a--b--a--b--b--|');
        var e1subs = '^          !      ';
        var expected = '-----------#      ';
        var predicate = function (value) {
            return value === 'b';
        };
        expectObservable(e1.single(predicate)).toBe(expected, null, 'Sequence contains more than one element');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error from predicate if observable does not emit', function () {
        var e1 = hot('--a--^--|');
        var e1subs = '^  !';
        var expected = '---#';
        var predicate = function (value) {
            return value === 'a';
        };
        expectObservable(e1.single(predicate)).toBe(expected, null, new Rx.EmptyError());
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return undefined from predicate if observable does not contain matching element', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^          !';
        var expected = '-----------(z|)';
        var predicate = function (value) {
            return value === 'x';
        };
        expectObservable(e1.single(predicate)).toBe(expected, { z: undefined });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=single-spec.js.map