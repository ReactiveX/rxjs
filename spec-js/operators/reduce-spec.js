"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {reduce} */
describe('Observable.prototype.reduce', function () {
    asDiagram('reduce((acc, curr) => acc + curr, 0)')('should reduce', function () {
        var values = {
            a: 1, b: 3, c: 5, x: 9
        };
        var e1 = hot('--a--b--c--|', values);
        var e1subs = '^          !';
        var expected = '-----------(x|)';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, 0)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should reduce with seed', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^       !';
        var expected = '--------(x|)';
        var seed = 'n';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected, { x: seed + 'ab' });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should reduce with seed if source is empty', function () {
        var e1 = hot('--a--^-------|');
        var e1subs = '^       !';
        var expected = '--------(x|)';
        var expectedValue = '42';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected, { x: expectedValue });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if reduce function throws without seed', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^    !   ';
        var expected = '-----#   ';
        var reduceFunction = function (o, x) {
            throw 'error';
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--b--|');
        var unsub = '      !  ';
        var e1subs = '^     !  ';
        var expected = '-------  ';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        var result = e1.reduce(reduceFunction);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^     !  ';
        var expected = '-------  ';
        var unsub = '      !  ';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .reduce(reduceFunction)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source emits and raises error with seed', function () {
        var e1 = hot('--a--b--#');
        var e1subs = '^       !';
        var expected = '--------#';
        var expectedValue = '42';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source raises error with seed', function () {
        var e1 = hot('----#');
        var e1subs = '^   !';
        var expected = '----#';
        var expectedValue = '42';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, expectedValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if reduce function throws with seed', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^ !     ';
        var expected = '--#     ';
        var seed = 'n';
        var reduceFunction = function (o, x) {
            throw 'error';
        };
        expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete with seed if source emits but does not completes', function () {
        var e1 = hot('--a--');
        var e1subs = '^    ';
        var expected = '-----';
        var seed = 'n';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete with seed if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        var seed = 'n';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction, seed)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete without seed if source emits but does not completes', function () {
        var e1 = hot('--a--b--');
        var e1subs = '^       ';
        var expected = '--------';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not complete without seed if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should reduce if source does not emit without seed', function () {
        var e1 = hot('--a--^-------|');
        var e1subs = '^       !';
        var expected = '--------|';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source emits and raises error without seed', function () {
        var e1 = hot('--a--b--#');
        var e1subs = '^       !';
        var expected = '--------#';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if source raises error without seed', function () {
        var e1 = hot('----#');
        var e1subs = '^   !';
        var expected = '----#';
        var reduceFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.reduce(reduceFunction)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=reduce-spec.js.map