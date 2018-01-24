"use strict";
var chai_1 = require('chai');
var Rx = require('../../dist/package/Rx');
var Observable = Rx.Observable;
/** @test {takeLast} */
describe('Observable.prototype.skipLast', function () {
    asDiagram('skipLast(2)')('should skip two values of an observable with many values', function () {
        var e1 = cold('--a-----b----c---d--|');
        var e1subs = '^                   !';
        var expected = '-------------a---b--|';
        expectObservable(e1.skipLast(2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip last three values', function () {
        var e1 = cold('--a-----b----c---d--|');
        var e1subs = '^                   !';
        var expected = '-----------------a--|';
        expectObservable(e1.skipLast(3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip all values when trying to take larger then source', function () {
        var e1 = cold('--a-----b----c---d--|');
        var e1subs = '^                   !';
        var expected = '--------------------|';
        expectObservable(e1.skipLast(5)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip all element when try to take exact', function () {
        var e1 = cold('--a-----b----c---d--|');
        var e1subs = '^                   !';
        var expected = '--------------------|';
        expectObservable(e1.skipLast(4)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not skip any values', function () {
        var e1 = cold('--a-----b----c---d--|');
        var e1subs = '^                   !';
        var expected = '--a-----b----c---d--|';
        expectObservable(e1.skipLast(0)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.skipLast(42)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should go on forever on never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.skipLast(42)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip one value from an observable with one value', function () {
        var e1 = hot('---(a|)');
        var e1subs = '^  !   ';
        var expected = '---|   ';
        expectObservable(e1.skipLast(1)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should skip one value from an observable with many values', function () {
        var e1 = hot('--a--^--b----c---d--|');
        var e1subs = '^              !';
        var expected = '--------b---c--|';
        expectObservable(e1.skipLast(1)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with empty and early emission', function () {
        var e1 = hot('--a--^----|');
        var e1subs = '^    !';
        var expected = '-----|';
        expectObservable(e1.skipLast(42)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should propagate error from the source observable', function () {
        var e1 = hot('---^---#', null, 'too bad');
        var e1subs = '^   !';
        var expected = '----#';
        expectObservable(e1.skipLast(42)).toBe(expected, null, 'too bad');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should propagate error from an observable with values', function () {
        var e1 = hot('---^--a--b--#');
        var e1subs = '^        !';
        var expected = '---------#';
        expectObservable(e1.skipLast(42)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('---^--a--b-----c--d--e--|');
        var unsub = '         !            ';
        var e1subs = '^        !            ';
        var expected = '----------            ';
        expectObservable(e1.skipLast(42), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with throw', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.skipLast(42)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should throw if total is less than zero', function () {
        chai_1.expect(function () { Observable.range(0, 10).skipLast(-1); })
            .to.throw(Rx.ArgumentOutOfRangeError);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var e1 = hot('---^--a--b-----c--d--e--|');
        var unsub = '         !            ';
        var e1subs = '^        !            ';
        var expected = '----------            ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .skipLast(42)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=skipLast-spec.js.map