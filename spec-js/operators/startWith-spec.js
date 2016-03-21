"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {startWith} */
describe('Observable.prototype.startWith', function () {
    var defaultStartValue = 'x';
    asDiagram('startWith(s)')('should prepend to a cold Observable', function () {
        var e1 = cold('---a--b--c--|');
        var e1subs = '^           !';
        var expected = 's--a--b--c--|';
        expectObservable(e1.startWith('s')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start an observable with given value', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = 'x-a--|';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and does not completes if source does not completes', function () {
        var e1 = hot('----a-');
        var e1subs = '^     ';
        var expected = 'x---a-';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and does not completes if source never emits', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = 'x-';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and completes if source does not emits', function () {
        var e1 = hot('---|');
        var e1subs = '^  !';
        var expected = 'x--|';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and complete immediately if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '(x|)';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and source both if source emits single value', function () {
        var e1 = cold('(a|)');
        var e1subs = '(^!)';
        var expected = '(xa|)';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given values when given value is more than one', function () {
        var e1 = hot('-----a--|');
        var e1subs = '^       !';
        var expected = '(yz)-a--|';
        expectObservable(e1.startWith('y', 'z')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and raises error if source raises error', function () {
        var e1 = hot('--#');
        var e1subs = '^ !';
        var expected = 'x-#';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected, defaultStartValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with given value and raises error immediately if source throws error', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '(x#)';
        expectObservable(e1.startWith(defaultStartValue)).toBe(expected, defaultStartValue);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('---a--b----c--d--|');
        var unsub = '         !        ';
        var e1subs = '^        !        ';
        var expected = 's--a--b---';
        var values = { s: 's', a: 'a', b: 'b' };
        var result = e1.startWith('s', rxTestScheduler);
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('---a--b----c--d--|');
        var e1subs = '^        !        ';
        var expected = 's--a--b---        ';
        var unsub = '         !        ';
        var values = { s: 's', a: 'a', b: 'b' };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .startWith('s', rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should start with empty if given value is not specified', function () {
        var e1 = hot('-a-|');
        var e1subs = '^  !';
        var expected = '-a-|';
        expectObservable(e1.startWith(rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should accept scheduler as last argument with single value', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = 'x-a--|';
        expectObservable(e1.startWith(defaultStartValue, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should accept scheduler as last argument with multiple value', function () {
        var e1 = hot('-----a--|');
        var e1subs = '^       !';
        var expected = '(yz)-a--|';
        expectObservable(e1.startWith('y', 'z', rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=startWith-spec.js.map