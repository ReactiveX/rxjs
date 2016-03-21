"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {merge} */
describe('Observable.merge(...observables)', function () {
    it('should merge cold and cold', function () {
        var e1 = cold('---a-----b-----c----|');
        var e1subs = '^                   !';
        var e2 = cold('------x-----y-----z----|');
        var e2subs = '^                      !';
        var expected = '---a--x--b--y--c--z----|';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should return itself when try to merge single observable', function () {
        var e1 = Observable.of('a');
        var result = Observable.merge(e1);
        expect(e1).toBe(result);
    });
    it('should merge hot and hot', function () {
        var e1 = hot('---a---^-b-----c----|');
        var e1subs = '^            !';
        var e2 = hot('-----x-^----y-----z----|');
        var e2subs = '^               !';
        var expected = '--b--y--c--z----|';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge hot and cold', function () {
        var e1 = hot('---a-^---b-----c----|');
        var e1subs = '^              !';
        var e2 = cold('--x-----y-----z----|');
        var e2subs = '^                  !';
        var expected = '--x-b---y-c---z----|';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge parallel emissions', function () {
        var e1 = hot('---a----b----c----|');
        var e1subs = '^                 !';
        var e2 = hot('---x----y----z----|');
        var e2subs = '^                 !';
        var expected = '---(ax)-(by)-(cz)-|';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge empty and empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = cold('|');
        var e2subs = '(^!)';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('|');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge three empties', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = cold('|');
        var e2subs = '(^!)';
        var e3 = cold('|');
        var e3subs = '(^!)';
        var result = Observable.merge(e1, e2, e3);
        expectObservable(result).toBe('|');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
    it('should merge never and empty', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('|');
        var e2subs = '(^!)';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('-');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge never and never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('-');
        var e2subs = '^';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('-');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge empty and throw', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = cold('#');
        var e2subs = '(^!)';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('#');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge hot and throw', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '(^!)';
        var e2 = cold('#');
        var e2subs = '(^!)';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('#');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge never and throw', function () {
        var e1 = cold('-');
        var e1subs = '(^!)';
        var e2 = cold('#');
        var e2subs = '(^!)';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe('#');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge empty and eventual error', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = hot('-------#');
        var e2subs = '^------!';
        var expected = '-------#';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge hot and error', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^      !    ';
        var e2 = hot('-------#    ');
        var e2subs = '^      !    ';
        var expected = '--a--b-#    ';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should merge never and error', function () {
        var e1 = hot('-');
        var e1subs = '^      !';
        var e2 = hot('-------#');
        var e2subs = '^      !';
        var expected = '-------#';
        var result = Observable.merge(e1, e2);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
describe('Observable.merge(...observables, Scheduler, number)', function () {
    it('should handle concurrency limits', function () {
        var e1 = cold('---a---b---c---|');
        var e2 = cold('-d---e---f--|');
        var e3 = cold('---x---y---z---|');
        var expected = '-d-a-e-b-f-c---x---y---z---|';
        expectObservable(Observable.merge(e1, e2, e3, 2)).toBe(expected);
    });
    it('should handle scheduler', function () {
        var e1 = Observable.of('a');
        var e2 = Observable.of('b').delay(20, rxTestScheduler);
        var expected = 'a-(b|)';
        expectObservable(Observable.merge(e1, e2, rxTestScheduler)).toBe(expected);
    });
    it('should handle scheduler with concurrency limits', function () {
        var e1 = cold('---a---b---c---|');
        var e2 = cold('-d---e---f--|');
        var e3 = cold('---x---y---z---|');
        var expected = '-d-a-e-b-f-c---x---y---z---|';
        expectObservable(Observable.merge(e1, e2, e3, 2, rxTestScheduler)).toBe(expected);
    });
});
//# sourceMappingURL=merge-spec.js.map