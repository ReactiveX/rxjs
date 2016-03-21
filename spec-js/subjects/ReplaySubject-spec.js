"use strict";
var Rx = require('../../dist/cjs/Rx');
var ReplaySubject = Rx.ReplaySubject;
var Observable = Rx.Observable;
/** @test {ReplaySubject} */
describe('ReplaySubject', function () {
    it('should extend Subject', function (done) {
        var subject = new ReplaySubject();
        expect(subject instanceof Rx.Subject).toBe(true);
        done();
    });
    it('should replay values upon subscription', function (done) {
        var subject = new ReplaySubject();
        var expects = [1, 2, 3];
        var i = 0;
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.subscribe(function (x) {
            expect(x).toBe(expects[i++]);
            if (i === 3) {
                subject.complete();
            }
        }, function (err) {
            done.fail('should not be called');
        }, done);
    });
    it('should replay values and complete', function (done) {
        var subject = new ReplaySubject();
        var expects = [1, 2, 3];
        var i = 0;
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete();
        subject.subscribe(function (x) {
            expect(x).toBe(expects[i++]);
        }, null, done);
    });
    it('should replay values and error', function (done) {
        var subject = new ReplaySubject();
        var expects = [1, 2, 3];
        var i = 0;
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.error('fooey');
        subject.subscribe(function (x) {
            expect(x).toBe(expects[i++]);
        }, function (err) {
            expect(err).toBe('fooey');
            done();
        });
    });
    it('should only replay values within its buffer size', function (done) {
        var subject = new ReplaySubject(2);
        var expects = [2, 3];
        var i = 0;
        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.subscribe(function (x) {
            expect(x).toBe(expects[i++]);
            if (i === 2) {
                subject.complete();
            }
        }, function (err) {
            done.fail('should not be called');
        }, done);
    });
    describe('with bufferSize=2', function () {
        it('should replay 2 previous values when subscribed', function () {
            var replaySubject = new ReplaySubject(2);
            function feedNextIntoSubject(x) { replaySubject.next(x); }
            function feedErrorIntoSubject(err) { replaySubject.error(err); }
            function feedCompleteIntoSubject() { replaySubject.complete(); }
            var sourceTemplate = '-1-2-3----4------5-6---7--8----9--|';
            var subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
            var unsub1 = '                     !             ';
            var expected1 = '      (23)4------5-6--             ';
            var subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
            var unsub2 = '                         !         ';
            var expected2 = '            (34)-5-6---7--         ';
            var subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
            var expected3 = '                           (78)9--|';
            expectObservable(hot(sourceTemplate).do(feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject)).toBe(sourceTemplate);
            expectObservable(subscriber1, unsub1).toBe(expected1);
            expectObservable(subscriber2, unsub2).toBe(expected2);
            expectObservable(subscriber3).toBe(expected3);
        });
        it('should replay 2 last values for when subscribed after completed', function () {
            var replaySubject = new ReplaySubject(2);
            function feedNextIntoSubject(x) { replaySubject.next(x); }
            function feedErrorIntoSubject(err) { replaySubject.error(err); }
            function feedCompleteIntoSubject() { replaySubject.complete(); }
            var sourceTemplate = '-1-2-3--4--|';
            var subscriber1 = hot('               (a|) ').mergeMapTo(replaySubject);
            var expected1 = '               (34|)';
            expectObservable(hot(sourceTemplate).do(feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject)).toBe(sourceTemplate);
            expectObservable(subscriber1).toBe(expected1);
        });
        it('should handle subscribers that arrive and leave at different times, ' +
            'subject does not complete', function () {
            var subject = new ReplaySubject(2);
            var results1 = [];
            var results2 = [];
            var results3 = [];
            subject.next(1);
            subject.next(2);
            subject.next(3);
            subject.next(4);
            var subscription1 = subject.subscribe(function (x) { results1.push(x); }, function (err) { results1.push('E'); }, function () { results1.push('C'); });
            subject.next(5);
            var subscription2 = subject.subscribe(function (x) { results2.push(x); }, function (err) { results2.push('E'); }, function () { results2.push('C'); });
            subject.next(6);
            subject.next(7);
            subscription1.unsubscribe();
            subject.next(8);
            subscription2.unsubscribe();
            subject.next(9);
            subject.next(10);
            var subscription3 = subject.subscribe(function (x) { results3.push(x); }, function (err) { results3.push('E'); }, function () { results3.push('C'); });
            subject.next(11);
            subscription3.unsubscribe();
            expect(results1).toEqual([3, 4, 5, 6, 7]);
            expect(results2).toEqual([4, 5, 6, 7, 8]);
            expect(results3).toEqual([9, 10, 11]);
            subject.complete();
        });
    });
    describe('with windowTime=40', function () {
        it('should replay previous values since 40 time units ago when subscribed', function () {
            var replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
            function feedNextIntoSubject(x) { replaySubject.next(x); }
            function feedErrorIntoSubject(err) { replaySubject.error(err); }
            function feedCompleteIntoSubject() { replaySubject.complete(); }
            var sourceTemplate = '-1-2-3----4------5-6----7-8----9--|';
            var subscriber1 = hot('      (a|)                         ').mergeMapTo(replaySubject);
            var unsub1 = '                     !             ';
            var expected1 = '      (23)4------5-6--             ';
            var subscriber2 = hot('            (b|)                   ').mergeMapTo(replaySubject);
            var unsub2 = '                         !         ';
            var expected2 = '            4----5-6----7-         ';
            var subscriber3 = hot('                           (c|)    ').mergeMapTo(replaySubject);
            var expected3 = '                           (78)9--|';
            expectObservable(hot(sourceTemplate).do(feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject)).toBe(sourceTemplate);
            expectObservable(subscriber1, unsub1).toBe(expected1);
            expectObservable(subscriber2, unsub2).toBe(expected2);
            expectObservable(subscriber3).toBe(expected3);
        });
        it('should replay last values since 40 time units ago when subscribed', function () {
            var replaySubject = new ReplaySubject(Number.POSITIVE_INFINITY, 40, rxTestScheduler);
            function feedNextIntoSubject(x) { replaySubject.next(x); }
            function feedErrorIntoSubject(err) { replaySubject.error(err); }
            function feedCompleteIntoSubject() { replaySubject.complete(); }
            var sourceTemplate = '-1-2-3----4|';
            var subscriber1 = hot('             (a|)').mergeMapTo(replaySubject);
            var expected1 = '             (4|)';
            expectObservable(hot(sourceTemplate).do(feedNextIntoSubject, feedErrorIntoSubject, feedCompleteIntoSubject)).toBe(sourceTemplate);
            expectObservable(subscriber1).toBe(expected1);
        });
    });
    it('should be an Observer which can be given to Observable.subscribe', function (done) {
        var source = Observable.of(1, 2, 3, 4, 5);
        var subject = new ReplaySubject(3);
        var expected = [3, 4, 5];
        source.subscribe(subject);
        subject.subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, done.fail, done);
    });
});
//# sourceMappingURL=ReplaySubject-spec.js.map