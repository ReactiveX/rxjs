"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {sample} */
describe('Observable.prototype.sample', function () {
    asDiagram('sample')('should get samples when the notifier emits', function () {
        var e1 = hot('---a----b---c----------d-----|   ');
        var e1subs = '^                            !   ';
        var e2 = hot('-----x----------x---x------x---|');
        var e2subs = '^                            !   ';
        var expected = '-----a----------c----------d-|   ';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should sample nothing if source has not nexted at all', function () {
        var e1 = hot('----a-^------------|');
        var e1subs = '^            !';
        var e2 = hot('-----x-------|');
        var e2subs = '^            !';
        var expected = '-------------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should sample nothing if source has nexted after all notifications, but notifier does not complete', function () {
        var e1 = hot('----a-^------b-----|');
        var e1subs = '^            !';
        var e2 = hot('-----x--------');
        var e2subs = '^            !';
        var expected = '-------------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should sample when the notifier completes', function () {
        var e1 = hot('----a-^------b----------|');
        var e1subs = '^                 !';
        var e2 = hot('-----x-----|');
        var e2subs = '^          !';
        var expected = '-----------b------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not complete when the notifier completes, nor should it emit', function () {
        var e1 = hot('----a----b----c----d----e----f----');
        var e1subs = '^                                 ';
        var e2 = hot('------x-|                         ');
        var e2subs = '^       !                         ';
        var expected = '------a---------------------------';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should complete only when the source completes, if notifier completes early', function () {
        var e1 = hot('----a----b----c----d----e----f---|');
        var e1subs = '^                                !';
        var e2 = hot('------x-|                         ');
        var e2subs = '^       !                         ';
        var expected = '------a--------------------------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('----a-^--b----c----d----e----f----|          ');
        var unsub = '              !                        ';
        var e1subs = '^             !                        ';
        var e2 = hot('-----x----------x----------x----------|');
        var e2subs = '^             !                        ';
        var expected = '-----b---------                        ';
        expectObservable(e1.sample(e2), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('----a-^--b----c----d----e----f----|          ');
        var e1subs = '^             !                        ';
        var e2 = hot('-----x----------x----------x----------|');
        var e2subs = '^             !                        ';
        var expected = '-----b---------                        ';
        var unsub = '              !                        ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .sample(e2)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should only sample when a new value arrives, even if it is the same value', function () {
        var e1 = hot('----a----b----c----c----e----f----|  ');
        var e1subs = '^                                 !  ';
        var e2 = hot('------x-x------xx-x---x----x--------|');
        var e2subs = '^                                 !  ';
        var expected = '------a--------c------c----e------|  ';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if source raises error', function () {
        var e1 = hot('----a-^--b----c----d----#                    ');
        var e1subs = '^                 !                    ';
        var e2 = hot('-----x----------x----------x----------|');
        var e2subs = '^                 !                    ';
        var expected = '-----b----------d-#                    ';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should completes if source does not emits', function () {
        var e1 = hot('|');
        var e2 = hot('------x-------|');
        var expected = '|';
        var e1subs = '(^!)';
        var e2subs = '(^!)';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if source throws immediately', function () {
        var e1 = hot('#');
        var e2 = hot('------x-------|');
        var expected = '#';
        var e1subs = '(^!)';
        var e2subs = '(^!)';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if notification raises error', function () {
        var e1 = hot('--a-----|');
        var e2 = hot('----#');
        var expected = '----#';
        var e1subs = '^   !';
        var e2subs = '^   !';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not completes if source does not complete', function () {
        var e1 = hot('-');
        var e1subs = '^              ';
        var e2 = hot('------x-------|');
        var e2subs = '^             !';
        var expected = '-';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should sample only until source completes', function () {
        var e1 = hot('----a----b----c----d-|');
        var e1subs = '^                    !';
        var e2 = hot('-----------x----------x------------|');
        var e2subs = '^                    !';
        var expected = '-----------b---------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should complete sampling if sample observable completes', function () {
        var e1 = hot('----a----b----c----d-|');
        var e1subs = '^                    !';
        var e2 = hot('|');
        var e2subs = '(^!)';
        var expected = '---------------------|';
        expectObservable(e1.sample(e2)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
//# sourceMappingURL=sample-spec.js.map