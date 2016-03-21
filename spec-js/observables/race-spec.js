"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {race} */
describe('Observable.race', function () {
    it('should race a single observable', function () {
        var e1 = cold('---a-----b-----c----|');
        var e1subs = '^                   !';
        var expected = '---a-----b-----c----|';
        var result = Observable.race(e1);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should race cold and cold', function () {
        var e1 = cold('---a-----b-----c----|');
        var e1subs = '^                   !';
        var e2 = cold('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---a-----b-----c----|';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should race hot and hot', function () {
        var e1 = hot('---a-----b-----c----|');
        var e1subs = '^                   !';
        var e2 = hot('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---a-----b-----c----|';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should race hot and cold', function () {
        var e1 = cold('---a-----b-----c----|');
        var e1subs = '^                   !';
        var e2 = hot('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---a-----b-----c----|';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should race 2nd and 1st', function () {
        var e1 = cold('------x-----y-----z----|');
        var e1subs = '^  !';
        var e2 = cold('---a-----b-----c----|');
        var e2subs = '^                   !';
        var expected = '---a-----b-----c----|';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should race emit and complete', function () {
        var e1 = cold('-----|');
        var e1subs = '^    !';
        var e2 = hot('------x-----y-----z----|');
        var e2subs = '^    !';
        var expected = '-----|';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = cold('---a-----b-----c----|');
        var e1subs = '^           !';
        var e2 = hot('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---a-----b---';
        var unsub = '            !';
        var result = Observable.race(e1, e2);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var e1 = hot('--a--^--b--c---d-| ');
        var e1subs = '^        !    ';
        var e2 = hot('---e-^---f--g---h-|');
        var e2subs = '^  !    ';
        var expected = '---b--c---    ';
        var unsub = '         !    ';
        var result = Observable.race(e1.mergeMap(function (x) { return Observable.of(x); }), e2.mergeMap(function (x) { return Observable.of(x); })).mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should never emit when given non emitting sources', function () {
        var e1 = cold('---|');
        var e2 = cold('---|');
        var e1subs = '^  !';
        var expected = '---|';
        var source = Observable.race(e1, e2);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should throw when error occurs mid stream', function () {
        var e1 = cold('---a-----#');
        var e1subs = '^        !';
        var e2 = cold('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---a-----#';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should throw when error occurs before a winner is found', function () {
        var e1 = cold('---#');
        var e1subs = '^  !';
        var e2 = cold('------x-----y-----z----|');
        var e2subs = '^  !';
        var expected = '---#';
        var result = Observable.race(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('handle empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        var source = Observable.race(e1);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        var source = Observable.race(e1);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle throw', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        var source = Observable.race(e1);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=race-spec.js.map