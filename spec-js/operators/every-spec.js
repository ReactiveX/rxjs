"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {every} */
describe('Observable.prototype.every', function () {
    function truePredicate(x) {
        return true;
    }
    function predicate(x) {
        return x % 5 === 0;
    }
    asDiagram('every(x => x % 5 === 0)')('should return false if only some of element matches with predicate', function () {
        var source = hot('--a--b--c--d--e--|', { a: 5, b: 10, c: 15, d: 18, e: 20 });
        var sourceSubs = '^          !      ';
        var expected = '-----------(F|)   ';
        expectObservable(source.every(predicate)).toBe(expected, { F: false });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should accept thisArg with scalar observables', function () {
        var thisArg = {};
        Observable.of(1).every(function (value, index) {
            expect(this).toBe(thisArg);
            return true;
        }, thisArg).subscribe();
    });
    it('should accept thisArg with array observables', function () {
        var thisArg = {};
        Observable.of(1, 2, 3, 4).every(function (value, index) {
            expect(this).toBe(thisArg);
            return true;
        }, thisArg).subscribe();
    });
    it('should accept thisArg with ordinary observables', function () {
        var thisArg = {};
        Observable.create(function (observer) {
            observer.next(1);
            observer.complete();
        })
            .every(function (value, index) {
            expect(this).toBe(thisArg);
        }, thisArg).subscribe();
    });
    it('should emit true if source is empty', function () {
        var source = hot('-----|');
        var sourceSubs = '^    !';
        var expected = '-----(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: true });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit false if single source of element does not match with predicate', function () {
        var source = hot('--a--|');
        var sourceSubs = '^ !';
        var expected = '--(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: false });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit false if none of element does not match with predicate', function () {
        var source = hot('--a--b--c--d--e--|');
        var sourceSubs = '^ !';
        var expected = '--(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: false });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should return false if only some of element matches with predicate', function () {
        var source = hot('--a--b--c--d--e--|', { a: 5, b: 10, c: 15 });
        var sourceSubs = '^          !';
        var expected = '-----------(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: false });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var source = hot('--a--b--c--d--e--|', { a: 5, b: 10, c: 15 });
        var sourceSubs = '^      !          ';
        var expected = '--------          ';
        var unsub = '       !          ';
        var result = source.every(predicate);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should not break unsubscription chains when result Observable is unsubscribed', function () {
        var source = hot('--a--b--c--d--e--|', { a: 5, b: 10, c: 15 });
        var sourceSubs = '^      !          ';
        var expected = '--------          ';
        var unsub = '       !          ';
        var result = source
            .mergeMap(function (x) { return Observable.of(x); })
            .every(predicate)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should propagate error if predicate eventually throws', function () {
        var source = hot('--a--b--c--d--e--|');
        var sourceSubs = '^       !';
        var expected = '--------#';
        function faultyPredicate(x) {
            if (x === 'c') {
                throw 'error';
            }
            else {
                return true;
            }
        }
        expectObservable(source.every(faultyPredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit true if single source element match with predicate', function () {
        var source = hot('--a--|', { a: 5 });
        var sourceSubs = '^    !';
        var expected = '-----(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: true });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit true if Scalar source matches with predicate', function () {
        var source = Observable.of(5);
        var expected = '(T|)';
        expectObservable(source.every(predicate)).toBe(expected, { T: true });
    });
    it('should emit false if Scalar source does not match with predicate', function () {
        var source = Observable.of(3);
        var expected = '(F|)';
        expectObservable(source.every(predicate)).toBe(expected, { F: false });
    });
    it('should propagate error if predicate throws on Scalar source', function () {
        var source = Observable.of(3);
        var expected = '#';
        function faultyPredicate(x) {
            throw 'error';
        }
        expectObservable(source.every(faultyPredicate)).toBe(expected);
    });
    it('should emit true if Array source matches with predicate', function () {
        var source = Observable.of(5, 10, 15, 20);
        var expected = '(T|)';
        expectObservable(source.every(predicate)).toBe(expected, { T: true });
    });
    it('should emit false if Array source does not match with predicate', function () {
        var source = Observable.of(5, 9, 15, 20);
        var expected = '(F|)';
        expectObservable(source.every(predicate)).toBe(expected, { F: false });
    });
    it('should propagate error if predicate eventually throws on Array source', function () {
        var source = Observable.of(5, 10, 15, 20);
        var expected = '#';
        function faultyPredicate(x) {
            if (x === 15) {
                throw 'error';
            }
            return true;
        }
        expectObservable(source.every(faultyPredicate)).toBe(expected);
    });
    it('should emit true if all source element matches with predicate', function () {
        var source = hot('--a--b--c--d--e--|', { a: 5, b: 10, c: 15, d: 20, e: 25 });
        var sourceSubs = '^                !';
        var expected = '-----------------(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: true });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should raise error if source raises error', function () {
        var source = hot('--#');
        var sourceSubs = '^ !';
        var expected = '--#';
        expectObservable(source.every(truePredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should not completes if source never emits', function () {
        var source = cold('-');
        var sourceSubs = '^';
        var expected = '-';
        expectObservable(source.every(truePredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit true if source element matches with predicate after subscription', function () {
        var source = hot('--z--^--a--b--c--d--e--|', { a: 5, b: 10, c: 15, d: 20, e: 25 });
        var sourceSubs = '^                 !';
        var expected = '------------------(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: true });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit false if source element does not match with predicate after subscription', function () {
        var source = hot('--z--^--b--c--z--d--|', { a: 5, b: 10, c: 15, d: 20 });
        var sourceSubs = '^        !';
        var expected = '---------(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: false });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should raise error if source raises error after subscription', function () {
        var source = hot('--z--^--#');
        var sourceSubs = '^  !';
        var expected = '---#';
        expectObservable(source.every(truePredicate)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should emit true if source does not emit after subscription', function () {
        var source = hot('--z--^-----|');
        var sourceSubs = '^     !';
        var expected = '------(x|)';
        expectObservable(source.every(predicate)).toBe(expected, { x: true });
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
});
//# sourceMappingURL=every-spec.js.map