"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {debounceTime} */
describe('Observable.prototype.debounceTime', function () {
    asDiagram('debounceTime(20)')('should debounce values by 20 time units', function () {
        var e1 = hot('-a--bc--d---|');
        var expected = '---a---c--d-|';
        expectObservable(e1.debounceTime(20, rxTestScheduler)).toBe(expected);
    });
    it('should delay all element by the specified time', function () {
        var e1 = hot('-a--------b------c----|');
        var e1subs = '^                     !';
        var expected = '------a--------b------(c|)';
        expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should debounce and delay element by the specified time', function () {
        var e1 = hot('-a--(bc)-----------d-------|');
        var e1subs = '^                          !';
        var expected = '---------c--------------d--|';
        expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete when source does not emit', function () {
        var e1 = hot('-----|');
        var e1subs = '^    !';
        var expected = '-----|';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should complete when source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error when source does not emit and raises error', function () {
        var e1 = hot('-----#');
        var e1subs = '^    !';
        var expected = '-----#';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error when source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--bc--d----|');
        var e1subs = '^      !       ';
        var expected = '----a---       ';
        var unsub = '       !       ';
        var result = e1.debounceTime(20, rxTestScheduler);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var e1 = hot('--a--bc--d----|');
        var e1subs = '^      !       ';
        var expected = '----a---       ';
        var unsub = '       !       ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .debounceTime(20, rxTestScheduler)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should debounce and does not complete when source does not completes', function () {
        var e1 = hot('-a--(bc)-----------d-------');
        var e1subs = '^                          ';
        var expected = '---------c--------------d--';
        expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes when source does not completes', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not completes when source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should delay all element until source raises error', function () {
        var e1 = hot('-a--------b------c----#');
        var e1subs = '^                     !';
        var expected = '------a--------b------#';
        expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should debounce all elements while source emits within given time', function () {
        var e1 = hot('--a--b--c--d--e--f--g--h-|');
        var e1subs = '^                        !';
        var expected = '-------------------------(h|)';
        expectObservable(e1.debounceTime(40, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should debounce all element while source emits within given time until raises error', function () {
        var e1 = hot('--a--b--c--d--e--f--g--h-#');
        var e1subs = '^                        !';
        var expected = '-------------------------#';
        expectObservable(e1.debounceTime(40, rxTestScheduler)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=debounceTime-spec.js.map