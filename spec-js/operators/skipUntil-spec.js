"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {skipUntil} */
describe('Observable.prototype.skipUntil', function () {
    asDiagram('skipUntil')('should skip values until another observable notifies', function () {
        var e1 = hot('--a--b--c--d--e----|');
        var e1subs = '^                  !';
        var skip = hot('---------x------|   ');
        var skipSubs = '^               !   ';
        var expected = ('-----------d--e----|');
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should emit element only after another observable emits', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = hot('-----------x----| ');
        var skipSubs = '^               ! ';
        var expected = ('--------------e--|');
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip value and raises error until another observable raises error', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^            !    ';
        var skip = hot('-------------#    ');
        var skipSubs = '^            !    ';
        var expected = '-------------#    ';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element when another observable does not emit and completes early', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = hot('------------|     ');
        var skipSubs = '^           !     ';
        var expected = '-----------------|';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--b--c--d--e----|');
        var unsub = '         !          ';
        var e1subs = '^        !          ';
        var skip = hot('-------------x--|   ');
        var skipSubs = '^        !          ';
        var expected = ('----------          ');
        expectObservable(e1.skipUntil(skip), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--b--c--d--e----|');
        var e1subs = '^        !          ';
        var skip = hot('-------------x--|   ');
        var skipSubs = '^        !          ';
        var expected = ('----------          ');
        var unsub = '         !          ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .skipUntil(skip)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element when another observable is empty', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = cold('|');
        var skipSubs = '(^!)';
        var expected = '-----------------|';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should keep subscription to source, to wait for its eventual complete', function () {
        var e1 = hot('------------------------------|');
        var e1subs = '^                             !';
        var skip = hot('-------|                       ');
        var skipSubs = '^      !                       ';
        var expected = '------------------------------|';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should not complete if source observable does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var skip = hot('-------------x--|');
        var skipSubs = '^               !';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should not complete if source observable never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var skip = hot('-------------x--|');
        var skipSubs = '^               !';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should raise error if source does not completes when another observable raises error', function () {
        var e1 = hot('-');
        var e1subs = '^            !';
        var skip = hot('-------------#');
        var skipSubs = '^            !';
        var expected = '-------------#';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should raise error if source never completes when another observable raises error', function () {
        var e1 = cold('-');
        var e1subs = '^            !';
        var skip = hot('-------------#');
        var skipSubs = '^            !';
        var expected = '-------------#';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element and does not complete when another observable never completes', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = cold('-');
        var skipSubs = '^                !';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element and does not complete when another observable does not completes', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = hot('-');
        var skipSubs = '^                !';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element and does not complete when another observable completes after source', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var skip = hot('------------------------|');
        var skipSubs = '^                !';
        var expected = '------------------';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should not completes if source does not completes when another observable does not emit', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var skip = hot('--------------|');
        var skipSubs = '^             !';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should not completes if source and another observable both does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^';
        var skip = hot('-');
        var skipSubs = '^';
        var expected = '-';
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(skip.subscriptions).toBe(skipSubs);
    });
    it('should skip all element when another observable unsubscribed early before emit', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = ['^                !',
            '^                !']; // for the explicit subscribe some lines below
        var skip = new Rx.Subject();
        var expected = '-';
        e1.subscribe(function (x) {
            if (x === 'd' && !skip.isUnsubscribed) {
                skip.next('x');
            }
            skip.unsubscribe();
        });
        expectObservable(e1.skipUntil(skip)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=skipUntil-spec.js.map