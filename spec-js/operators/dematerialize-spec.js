"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Notification = Rx.Notification;
/** @test {dematerialize} */
describe('Observable.prototype.dematerialize', function () {
    asDiagram('dematerialize')('should dematerialize an Observable', function () {
        var values = {
            a: '{x}',
            b: '{y}',
            c: '{z}',
            d: '|'
        };
        var e1 = hot('--a--b--c--d-|', values);
        var expected = '--x--y--z--|';
        var result = e1.map(function (x) {
            if (x === '|') {
                return Notification.createComplete();
            }
            else {
                return Notification.createNext(x.replace('{', '').replace('}', ''));
            }
        }).dematerialize();
        expectObservable(result).toBe(expected);
    });
    it('should dematerialize a happy stream', function () {
        var values = {
            a: Notification.createNext('w'),
            b: Notification.createNext('x'),
            c: Notification.createNext('y'),
            d: Notification.createComplete()
        };
        var e1 = hot('--a--b--c--d--|', values);
        var e1subs = '^          !';
        var expected = '--w--x--y--|';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize a sad stream', function () {
        var values = {
            a: Notification.createNext('w'),
            b: Notification.createNext('x'),
            c: Notification.createNext('y'),
            d: Notification.createError('error')
        };
        var e1 = hot('--a--b--c--d--|', values);
        var e1subs = '^          !';
        var expected = '--w--x--y--#';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize stream does not completes', function () {
        var e1 = hot('------');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize stream never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize stream does not emit', function () {
        var e1 = hot('----|');
        var e1subs = '^   !';
        var expected = '----|';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize empty stream', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize stream throws', function () {
        var error = 'error';
        var e1 = hot('(x|)', { x: Notification.createError(error) });
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.dematerialize()).toBe(expected, null, error);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var values = {
            a: Notification.createNext('w'),
            b: Notification.createNext('x')
        };
        var e1 = hot('--a--b--c--d--|', values);
        var e1subs = '^      !       ';
        var expected = '--w--x--       ';
        var unsub = '       !       ';
        var result = e1.dematerialize();
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var values = {
            a: Notification.createNext('w'),
            b: Notification.createNext('x')
        };
        var e1 = hot('--a--b--c--d--|', values);
        var e1subs = '^      !       ';
        var expected = '--w--x--       ';
        var unsub = '       !       ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .dematerialize()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize and completes when stream compltes with complete notification', function () {
        var e1 = hot('----(a|)', { a: Notification.createComplete() });
        var e1subs = '^   !';
        var expected = '----|';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should dematerialize and completes when stream emits complete notification', function () {
        var e1 = hot('----a--|', { a: Notification.createComplete() });
        var e1subs = '^   !';
        var expected = '----|';
        expectObservable(e1.dematerialize()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=dematerialize-spec.js.map