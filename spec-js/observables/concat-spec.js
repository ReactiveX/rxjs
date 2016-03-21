"use strict";
/* globals describe, it, expect, expectObservable, expectSubscriptions, cold */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;
/** @test {concat} */
describe('Observable.concat', function () {
    it('should emit elements from multiple sources', function () {
        var e1 = cold('-a-b-c-|');
        var e1subs = '^      !';
        var e2 = cold('-0-1-|');
        var e2subs = '       ^    !';
        var e3 = cold('-w-x-y-z-|');
        var e3subs = '            ^        !';
        var expected = '-a-b-c--0-1--w-x-y-z-|';
        expectObservable(Observable.concat(e1, e2, e3)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
    it('should concat the same cold observable multiple times', function () {
        var inner = cold('--i-j-k-l-|                              ');
        var innersubs = ['^         !                              ',
            '          ^         !                    ',
            '                    ^         !          ',
            '                              ^         !'];
        var expected = '--i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';
        var result = Observable.concat(inner, inner, inner, inner);
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
    it('should concat the same cold observable multiple times, ' +
        'but the result is unsubscribed early', function () {
        var inner = cold('--i-j-k-l-|     ');
        var unsub = '               !';
        var innersubs = ['^         !     ',
            '          ^    !'];
        var expected = '--i-j-k-l---i-j-';
        var result = Observable.concat(inner, inner, inner, inner);
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var inner = cold('--i-j-k-l-|     ');
        var innersubs = ['^         !     ',
            '          ^    !'];
        var expected = '--i-j-k-l---i-j-';
        var unsub = '               !';
        var innerWrapped = inner.mergeMap(function (x) { return Observable.of(x); });
        var result = Observable
            .concat(innerWrapped, innerWrapped, innerWrapped, innerWrapped)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
    });
    it('should complete without emit if both sources are empty', function () {
        var e1 = cold('--|');
        var e1subs = '^ !';
        var e2 = cold('----|');
        var e2subs = '  ^   !';
        var expected = '------|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete if first source does not completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('--|');
        var e2subs = [];
        var expected = '-';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete if second source does not completes', function () {
        var e1 = cold('--|');
        var e1subs = '^ !';
        var e2 = cold('---');
        var e2subs = '  ^';
        var expected = '---';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete if both sources do not complete', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('-');
        var e2subs = [];
        var expected = '-';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error when first source is empty, second source raises error', function () {
        var e1 = cold('--|');
        var e1subs = '^ !';
        var e2 = cold('----#');
        var e2subs = '  ^   !';
        var expected = '------#';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error when first source raises error, second source is empty', function () {
        var e1 = cold('---#');
        var e1subs = '^  !';
        var e2 = cold('----|');
        var e2subs = [];
        var expected = '---#';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise first error when both source raise error', function () {
        var e1 = cold('---#');
        var e1subs = '^  !';
        var e2 = cold('------#');
        var e2subs = [];
        var expected = '---#';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should concat if first source emits once, second source is empty', function () {
        var e1 = cold('--a--|');
        var e1subs = '^    !';
        var e2 = cold('--------|');
        var e2subs = '     ^       !';
        var expected = '--a----------|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should concat if first source is empty, second source emits once', function () {
        var e1 = cold('--|');
        var e1subs = '^ !';
        var e2 = cold('--a--|');
        var e2subs = '  ^    !';
        var expected = '----a--|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should emit element from first source, and should not complete if second ' +
        'source does not completes', function () {
        var e1 = cold('--a--|');
        var e1subs = '^    !';
        var e2 = cold('-');
        var e2subs = '     ^';
        var expected = '--a---';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete if first source does not complete', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('--a--|');
        var e2subs = [];
        var expected = '-';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should emit elements from each source when source emit once', function () {
        var e1 = cold('---a|');
        var e1subs = '^   !';
        var e2 = cold('-----b--|');
        var e2subs = '    ^       !';
        var expected = '---a-----b--|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should unsubscribe to inner source if outer is unsubscribed early', function () {
        var e1 = cold('---a-a--a|            ');
        var e1subs = '^        !            ';
        var e2 = cold('-----b-b--b-|');
        var e2subs = '         ^       !    ';
        var unsub = '                 !    ';
        var expected = '---a-a--a-----b-b     ';
        expectObservable(Observable.concat(e1, e2), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error from first source and does not emit from second source', function () {
        var e1 = cold('--#');
        var e1subs = '^ !';
        var e2 = cold('----a--|');
        var e2subs = [];
        var expected = '--#';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should emit element from first source then raise error from second source', function () {
        var e1 = cold('--a--|');
        var e1subs = '^    !';
        var e2 = cold('-------#');
        var e2subs = '     ^      !';
        var expected = '--a---------#';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should emit all elements from both hot observable sources if first source ' +
        'completes before second source starts emit', function () {
        var e1 = hot('--a--b-|');
        var e1subs = '^      !';
        var e2 = hot('--------x--y--|');
        var e2subs = '       ^      !';
        var expected = '--a--b--x--y--|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should emit elements from second source regardless of completion time ' +
        'when second source is cold observable', function () {
        var e1 = hot('--a--b--c---|');
        var e1subs = '^           !';
        var e2 = cold('-x-y-z-|');
        var e2subs = '            ^      !';
        var expected = '--a--b--c----x-y-z-|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not emit collapsing element from second source', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^          !';
        var e2 = hot('--------x--y--z--|');
        var e2subs = '           ^     !';
        var expected = '--a--b--c--y--z--|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should return empty if concatenating an empty source', function () {
        var e1 = cold('|');
        var e1subs = ['(^!)', '(^!)'];
        var expected = '|';
        var result = Observable.concat(e1, e1);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should error immediately if given a just-throw source', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        var result = Observable.concat(e1, e1);
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit elements from second source regardless of completion time ' +
        'when second source is cold observable', function () {
        var e1 = hot('--a--b--c---|');
        var e1subs = '^           !';
        var e2 = cold('-x-y-z-|');
        var e2subs = '            ^      !';
        var expected = '--a--b--c----x-y-z-|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not emit collapsing element from second source', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^          !';
        var e2 = hot('--------x--y--z--|');
        var e2subs = '           ^     !';
        var expected = '--a--b--c--y--z--|';
        expectObservable(Observable.concat(e1, e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should concat an immediately-scheduled source with an immediately-scheduled second', function (done) {
        var a = Observable.of(1, 2, 3, queueScheduler);
        var b = Observable.of(4, 5, 6, 7, 8, queueScheduler);
        var r = [1, 2, 3, 4, 5, 6, 7, 8];
        Observable.concat(a, b, queueScheduler).subscribe(function (vals) {
            expect(vals).toBe(r.shift());
        }, null, done);
    });
});
//# sourceMappingURL=concat-spec.js.map