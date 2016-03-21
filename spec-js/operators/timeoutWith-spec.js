"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {timeoutWith} */
describe('Observable.prototype.timeoutWith', function () {
    asDiagram('timeoutWith(50)')('should timeout after a specified period then subscribe to the passed observable', function () {
        var e1 = cold('-------a--b--|');
        var e1subs = '^    !        ';
        var e2 = cold('x-y-z-|  ');
        var e2subs = '     ^     !  ';
        var expected = '-----x-y-z-|  ';
        var result = e1.timeoutWith(50, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout at a specified date then subscribe to the passed observable', function () {
        var e1 = cold('-');
        var e1subs = '^         !           ';
        var e2 = cold('--x--y--z--|');
        var e2subs = '          ^          !';
        var expected = '------------x--y--z--|';
        var result = e1.timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after a specified period between emit then subscribe ' +
        'to the passed observable when source emits', function () {
        var e1 = hot('---a---b------c---|');
        var e1subs = '^          !       ';
        var e2 = cold('-x-y-|  ');
        var e2subs = '           ^    !  ';
        var expected = '---a---b----x-y-|  ';
        var result = e1.timeoutWith(40, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('---a---b-----c----|');
        var e1subs = '^          !       ';
        var e2 = cold('-x---y| ');
        var e2subs = '           ^  !    ';
        var expected = '---a---b----x--    ';
        var unsub = '              !    ';
        var result = e1.timeoutWith(40, e2, rxTestScheduler);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var e1 = hot('---a---b-----c----|');
        var e1subs = '^          !       ';
        var e2 = cold('-x---y| ');
        var e2subs = '           ^  !    ';
        var expected = '---a---b----x--    ';
        var unsub = '              !    ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .timeoutWith(40, e2, rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not subscribe to withObservable after explicit unsubscription', function () {
        var e1 = cold('---a------b------');
        var e1subs = '^    !           ';
        var e2 = cold('i---j---|');
        var e2subs = [];
        var expected = '---a--           ';
        var unsub = '     !           ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .timeoutWith(50, e2, rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after a specified period then subscribe to the ' +
        'passed observable when source is empty', function () {
        var e1 = hot('-------------|      ');
        var e1subs = '^         !         ';
        var e2 = cold('----x----|');
        var e2subs = '          ^        !';
        var expected = '--------------x----|';
        var result = e1.timeoutWith(100, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after a specified period between emit then never completes ' +
        'if other source does not complete', function () {
        var e1 = hot('--a--b--------c--d--|');
        var e1subs = '^        !           ';
        var e2 = cold('-');
        var e2subs = '         ^           ';
        var expected = '--a--b----           ';
        var result = e1.timeoutWith(40, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after a specified period then subscribe to the ' +
        'passed observable when source raises error after timeout', function () {
        var e1 = hot('-------------#      ');
        var e1subs = '^         !         ';
        var e2 = cold('----x----|');
        var e2subs = '          ^        !';
        var expected = '--------------x----|';
        var result = e1.timeoutWith(100, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after a specified period between emit then never completes ' +
        'if other source emits but not complete', function () {
        var e1 = hot('-------------|     ');
        var e1subs = '^         !        ';
        var e2 = cold('----x----');
        var e2subs = '          ^        ';
        var expected = '--------------x----';
        var result = e1.timeoutWith(100, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not timeout if source completes within timeout period', function () {
        var e1 = hot('-----|');
        var e1subs = '^    !';
        var e2 = cold('----x----');
        var e2subs = [];
        var expected = '-----|';
        var result = e1.timeoutWith(100, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not timeout if source raises error within timeout period', function () {
        var e1 = hot('-----#');
        var e1subs = '^    !';
        var e2 = cold('----x----|');
        var e2subs = [];
        var expected = '-----#';
        var result = e1.timeoutWith(100, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not timeout if source emits within timeout period', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var e2 = cold('----x----|');
        var e2subs = [];
        var expected = '--a--b--c--d--e--|';
        var result = e1.timeoutWith(50, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout after specified Date then subscribe to the passed observable', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^      !          ';
        var e2 = cold('--z--|     ');
        var e2subs = '       ^    !     ';
        var expected = '--a--b---z--|     ';
        var result = e1.timeoutWith(new Date(rxTestScheduler.now() + 70), e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not timeout if source completes within specified Date', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var e2 = cold('--x--|');
        var e2subs = [];
        var expected = '--a--b--c--d--e--|';
        var timeoutValue = new Date(Date.now() + (expected.length + 2) * 10);
        var result = e1.timeoutWith(timeoutValue, e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not timeout if source raises error within specified Date', function () {
        var e1 = hot('---a---#');
        var e1subs = '^      !';
        var e2 = cold('--x--|');
        var e2subs = [];
        var expected = '---a---#';
        var result = e1.timeoutWith(new Date(Date.now() + 100), e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should timeout specified Date after specified Date then never completes ' +
        'if other source does not complete', function () {
        var e1 = hot('---a---b---c---d---e---|');
        var e1subs = '^         !             ';
        var e2 = cold('-');
        var e2subs = '          ^             ';
        var expected = '---a---b---             ';
        var result = e1.timeoutWith(new Date(rxTestScheduler.now() + 100), e2, rxTestScheduler);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
//# sourceMappingURL=timeoutWith-spec.js.map