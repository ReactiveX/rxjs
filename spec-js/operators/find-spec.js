"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {find} */
describe('Observable.prototype.find', function () {
    function truePredicate(x) {
        return true;
    }
    asDiagram('find(x => x % 5 === 0)')('should return matching element from source emits single element', function () {
        var values = { a: 3, b: 9, c: 15, d: 20 };
        var source = hot('---a--b--c--d---|', values);
        var subs = '^        !       ';
        var expected = '---------(c|)    ';
        var predicate = function (x) { return x % 5 === 0; };
        expectObservable(source.find(predicate)).toBe(expected, values);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should throw if not provided a function', function () {
        expect(function () {
            Observable.of('yut', 'yee', 'sam').find('yee');
        }).toThrow(new TypeError('predicate is not a function'));
    });
    it('should not emit if source does not emit', function () {
        var source = hot('-');
        var subs = '^';
        var expected = '-';
        expectObservable(source.find(truePredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return undefined if source is empty to match predicate', function () {
        var source = cold('|');
        var subs = '(^!)';
        var expected = '(x|)';
        var result = source.find(truePredicate);
        expectObservable(result).toBe(expected, { x: undefined });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return matching element from source emits single element', function () {
        var source = hot('--a--|');
        var subs = '^ !';
        var expected = '--(a|)';
        var predicate = function (value) {
            return value === 'a';
        };
        expectObservable(source.find(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return matching element from source emits multiple elements', function () {
        var source = hot('--a--b---c-|');
        var subs = '^    !';
        var expected = '-----(b|)';
        var predicate = function (value) {
            return value === 'b';
        };
        expectObservable(source.find(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should work with a custom thisArg', function () {
        var source = hot('--a--b---c-|');
        var subs = '^    !';
        var expected = '-----(b|)';
        var finder = {
            target: 'b'
        };
        var predicate = function (value) {
            return value === this.target;
        };
        expectObservable(source.find(predicate, finder)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return undefined if element does not match with predicate', function () {
        var source = hot('--a--b--c--|');
        var subs = '^          !';
        var expected = '-----------(x|)';
        var predicate = function (value) {
            return value === 'z';
        };
        expectObservable(source.find(predicate)).toBe(expected, { x: undefined });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var source = hot('--a--b--c--|');
        var subs = '^     !     ';
        var expected = '-------     ';
        var unsub = '      !     ';
        var result = source.find(function (value) { return value === 'z'; });
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
            .find(function (value) { return value === 'z'; })
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
        expectObservable(source.find(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise error if predicate throws error', function () {
        var source = hot('--a--b--c--|');
        var subs = '^ !';
        var expected = '--#';
        var predicate = function (value) {
            throw 'error';
        };
        expectObservable(source.find(predicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
});
//# sourceMappingURL=find-spec.js.map