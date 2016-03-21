"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {findIndex} */
describe('Observable.prototype.findIndex', function () {
    function truePredicate(x) {
        return true;
    }
    asDiagram('findIndex(x => x % 5 === 0)')('should return matching element from source emits single element', function () {
        var values = { a: 3, b: 9, c: 15, d: 20 };
        var source = hot('---a--b--c--d---|', values);
        var subs = '^        !       ';
        var expected = '---------(x|)    ';
        var predicate = function (x) { return x % 5 === 0; };
        expectObservable(source.findIndex(predicate)).toBe(expected, { x: 2 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not emit if source does not emit', function () {
        var source = hot('-');
        var subs = '^';
        var expected = '-';
        expectObservable(source.findIndex(truePredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return negative index if source is empty to match predicate', function () {
        var source = cold('|');
        var subs = '(^!)';
        var expected = '(x|)';
        var result = source.findIndex(truePredicate);
        expectObservable(result).toBe(expected, { x: -1 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return index of element from source emits single element', function () {
        var sourceValue = 1;
        var source = hot('--a--|', { a: sourceValue });
        var subs = '^ !   ';
        var expected = '--(x|)';
        var predicate = function (value) {
            return value === sourceValue;
        };
        expectObservable(source.findIndex(predicate)).toBe(expected, { x: 0 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return index of matching element from source emits multiple elements', function () {
        var source = hot('--a--b---c-|', { b: 7 });
        var subs = '^    !';
        var expected = '-----(x|)';
        var predicate = function (value) {
            return value === 7;
        };
        expectObservable(source.findIndex(predicate)).toBe(expected, { x: 1 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should work with a custom thisArg', function () {
        var sourceValues = { b: 7 };
        var source = hot('--a--b---c-|', sourceValues);
        var subs = '^    !';
        var expected = '-----(x|)';
        var predicate = function (value) {
            return value === this.b;
        };
        var result = source.findIndex(predicate, sourceValues);
        expectObservable(result).toBe(expected, { x: 1 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return negative index if element does not match with predicate', function () {
        var source = hot('--a--b--c--|');
        var subs = '^          !';
        var expected = '-----------(x|)';
        var predicate = function (value) {
            return value === 'z';
        };
        expectObservable(source.findIndex(predicate)).toBe(expected, { x: -1 });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var source = hot('--a--b--c--|');
        var subs = '^     !     ';
        var expected = '-------     ';
        var unsub = '      !     ';
        var result = source.findIndex(function (value) { return value === 'z'; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var source = hot('--a--b--c--|');
        var subs = '^     !     ';
        var expected = '-------     ';
        var unsub = '      !     ';
        var result = source
            .mergeMap(function (x) { return Observable.of(x); })
            .findIndex(function (value) { return value === 'z'; })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise if source raise error while element does not match with predicate', function () {
        var source = hot('--a--b--#');
        var subs = '^       !';
        var expected = '--------#';
        var predicate = function (value) {
            return value === 'z';
        };
        expectObservable(source.findIndex(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise error if predicate throws error', function () {
        var source = hot('--a--b--c--|');
        var subs = '^ !';
        var expected = '--#';
        var predicate = function (value) {
            throw 'error';
        };
        expectObservable(source.findIndex(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
});
//# sourceMappingURL=findIndex-spec.js.map