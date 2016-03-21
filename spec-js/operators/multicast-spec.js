"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Subject = Rx.Subject;
/** @test {multicast} */
describe('Observable.prototype.multicast', function () {
    asDiagram('multicast(() => new Subject())')('should mirror a simple source Observable', function () {
        var source = cold('--1-2---3-4--5-|');
        var sourceSubs = '^              !';
        var multicasted = source.multicast(function () { return new Subject(); });
        var expected = '--1-2---3-4--5-|';
        expectObservable(multicasted).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    it('should accept Subjects', function (done) {
        var expected = [1, 2, 3, 4];
        var connectable = Observable.of(1, 2, 3, 4).multicast(new Subject());
        connectable.subscribe(function (x) { expect(x).toBe(expected.shift()); }, done.fail, done);
        connectable.connect();
    });
    it('should accept Subject factory functions', function (done) {
        var expected = [1, 2, 3, 4];
        var connectable = Observable.of(1, 2, 3, 4).multicast(function () { return new Subject(); });
        connectable.subscribe(function (x) { expect(x).toBe(expected.shift()); }, done.fail, done);
        connectable.connect();
    });
    it('should do nothing if connect is not called, despite subscriptions', function () {
        var source = cold('--1-2---3-4--5-|');
        var sourceSubs = [];
        var multicasted = source.multicast(function () { return new Subject(); });
        var expected = '-';
        expectObservable(multicasted).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast the same values to multiple observers', function () {
        var source = cold('-1-2-3----4-|');
        var sourceSubs = '^           !';
        var multicasted = source.multicast(function () { return new Subject(); });
        var subscriber1 = hot('a|           ').mergeMapTo(multicasted);
        var expected1 = '-1-2-3----4-|';
        var subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
        var expected2 = '    -3----4-|';
        var subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
        var expected3 = '        --4-|';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    it('should multicast an error from the source to multiple observers', function () {
        var source = cold('-1-2-3----4-#');
        var sourceSubs = '^           !';
        var multicasted = source.multicast(function () { return new Subject(); });
        var subscriber1 = hot('a|           ').mergeMapTo(multicasted);
        var expected1 = '-1-2-3----4-#';
        var subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
        var expected2 = '    -3----4-#';
        var subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
        var expected3 = '        --4-#';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    it('should multicast the same values to multiple observers, ' +
        'but is unsubscribed explicitly and early', function () {
        var source = cold('-1-2-3----4-|');
        var sourceSubs = '^        !   ';
        var multicasted = source.multicast(function () { return new Subject(); });
        var unsub = '         u   ';
        var subscriber1 = hot('a|           ').mergeMapTo(multicasted);
        var expected1 = '-1-2-3----   ';
        var subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
        var expected2 = '    -3----   ';
        var subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
        var expected3 = '        --   ';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        // Set up unsubscription action
        var connection;
        expectObservable(hot(unsub).do(function () {
            connection.unsubscribe();
        })).toBe(unsub);
        connection = multicasted.connect();
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var source = cold('-1-2-3----4-|');
        var sourceSubs = '^        !   ';
        var multicasted = source
            .mergeMap(function (x) { return Observable.of(x); })
            .multicast(function () { return new Subject(); });
        var subscriber1 = hot('a|           ').mergeMapTo(multicasted);
        var expected1 = '-1-2-3----   ';
        var subscriber2 = hot('    b|       ').mergeMapTo(multicasted);
        var expected2 = '    -3----   ';
        var subscriber3 = hot('        c|   ').mergeMapTo(multicasted);
        var expected3 = '        --   ';
        var unsub = '         u   ';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        // Set up unsubscription action
        var connection;
        expectObservable(hot(unsub).do(function () {
            connection.unsubscribe();
        })).toBe(unsub);
        connection = multicasted.connect();
    });
    it('should multicast an empty source', function () {
        var source = cold('|');
        var sourceSubs = '(^!)';
        var multicasted = source.multicast(function () { return new Subject(); });
        var expected = '|';
        expectObservable(multicasted).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    it('should multicast a never source', function () {
        var source = cold('-');
        var sourceSubs = '^';
        var multicasted = source.multicast(function () { return new Subject(); });
        var expected = '-';
        expectObservable(multicasted).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    it('should multicast a throw source', function () {
        var source = cold('#');
        var sourceSubs = '(^!)';
        var multicasted = source.multicast(function () { return new Subject(); });
        var expected = '#';
        expectObservable(multicasted).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        multicasted.connect();
    });
    describe('with refCount() and subject factory', function () {
        it('should connect when first subscriber subscribes', function () {
            var source = cold('-1-2-3----4-|');
            var sourceSubs = '   ^           !';
            var multicasted = source.multicast(function () { return new Subject(); }).refCount();
            var subscriber1 = hot('   a|           ').mergeMapTo(multicasted);
            var expected1 = '   -1-2-3----4-|';
            var subscriber2 = hot('       b|       ').mergeMapTo(multicasted);
            var expected2 = '       -3----4-|';
            var subscriber3 = hot('           c|   ').mergeMapTo(multicasted);
            var expected3 = '           --4-|';
            expectObservable(subscriber1).toBe(expected1);
            expectObservable(subscriber2).toBe(expected2);
            expectObservable(subscriber3).toBe(expected3);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should disconnect when last subscriber unsubscribes', function () {
            var source = cold('-1-2-3----4-|');
            var sourceSubs = '   ^        !   ';
            var multicasted = source.multicast(function () { return new Subject(); }).refCount();
            var subscriber1 = hot('   a|           ').mergeMapTo(multicasted);
            var unsub1 = '          !     ';
            var expected1 = '   -1-2-3--     ';
            var subscriber2 = hot('       b|       ').mergeMapTo(multicasted);
            var unsub2 = '            !   ';
            var expected2 = '       -3----   ';
            expectObservable(subscriber1, unsub1).toBe(expected1);
            expectObservable(subscriber2, unsub2).toBe(expected2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be retryable when cold source is synchronous', function () {
            function subjectFactory() { return new Subject(); }
            var source = cold('(123#)');
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's               ';
            var expected1 = '(123123123123#) ';
            var subscribe2 = ' s              ';
            var expected2 = ' (123123123123#)';
            var sourceSubs = ['(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)'];
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.retry(3)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.retry(3)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be retryable with ReplaySubject and cold source is synchronous', function () {
            function subjectFactory() { return new Rx.ReplaySubject(1); }
            var source = cold('(123#)');
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's               ';
            var expected1 = '(123123123123#) ';
            var subscribe2 = ' s              ';
            var expected2 = ' (123123123123#)';
            var sourceSubs = ['(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)'];
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.retry(3)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.retry(3)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be repeatable when cold source is synchronous', function () {
            function subjectFactory() { return new Subject(); }
            var source = cold('(123|)');
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                  ';
            var expected1 = '(123123123123123|) ';
            var subscribe2 = ' s                 ';
            var expected2 = ' (123123123123123|)';
            var sourceSubs = ['(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)'];
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.repeat(5)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.repeat(5)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be repeatable with ReplaySubject and cold source is synchronous', function () {
            function subjectFactory() { return new Rx.ReplaySubject(1); }
            var source = cold('(123|)');
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                  ';
            var expected1 = '(123123123123123|) ';
            var subscribe2 = ' s                 ';
            var expected2 = ' (123123123123123|)';
            var sourceSubs = ['(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                '(^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)',
                ' (^!)'];
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.repeat(5)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.repeat(5)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be retryable', function () {
            function subjectFactory() { return new Subject(); }
            var source = cold('-1-2-3----4-#                        ');
            var sourceSubs = ['^           !                        ',
                '            ^           !            ',
                '                        ^           !'];
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                                    ';
            var expected1 = '-1-2-3----4--1-2-3----4--1-2-3----4-#';
            var subscribe2 = '    s                                ';
            var expected2 = '    -3----4--1-2-3----4--1-2-3----4-#';
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.retry(2)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.retry(2)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be retryable using a ReplaySubject', function () {
            function subjectFactory() { return new Rx.ReplaySubject(1); }
            var source = cold('-1-2-3----4-#                        ');
            var sourceSubs = ['^           !                        ',
                '            ^           !            ',
                '                        ^           !'];
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                                    ';
            var expected1 = '-1-2-3----4--1-2-3----4--1-2-3----4-#';
            var subscribe2 = '    s                                ';
            var expected2 = '    23----4--1-2-3----4--1-2-3----4-#';
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.retry(2)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.retry(2)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be repeatable', function () {
            function subjectFactory() { return new Subject(); }
            var source = cold('-1-2-3----4-|                        ');
            var sourceSubs = ['^           !                        ',
                '            ^           !            ',
                '                        ^           !'];
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                                    ';
            var expected1 = '-1-2-3----4--1-2-3----4--1-2-3----4-|';
            var subscribe2 = '    s                                ';
            var expected2 = '    -3----4--1-2-3----4--1-2-3----4-|';
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.repeat(3)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.repeat(3)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
        it('should be repeatable using a ReplaySubject', function () {
            function subjectFactory() { return new Rx.ReplaySubject(1); }
            var source = cold('-1-2-3----4-|                        ');
            var sourceSubs = ['^           !                        ',
                '            ^           !            ',
                '                        ^           !'];
            var multicasted = source.multicast(subjectFactory).refCount();
            var subscribe1 = 's                                    ';
            var expected1 = '-1-2-3----4--1-2-3----4--1-2-3----4-|';
            var subscribe2 = '    s                                ';
            var expected2 = '    23----4--1-2-3----4--1-2-3----4-|';
            expectObservable(hot(subscribe1).do(function () {
                expectObservable(multicasted.repeat(3)).toBe(expected1);
            })).toBe(subscribe1);
            expectObservable(hot(subscribe2).do(function () {
                expectObservable(multicasted.repeat(3)).toBe(expected2);
            })).toBe(subscribe2);
            expectSubscriptions(source.subscriptions).toBe(sourceSubs);
        });
    });
    it('should multicast one observable to multiple observers', function (done) {
        var results1 = [];
        var results2 = [];
        var subscriptions = 0;
        var source = new Observable(function (observer) {
            subscriptions++;
            observer.next(1);
            observer.next(2);
            observer.next(3);
            observer.next(4);
            observer.complete();
        });
        var connectable = source.multicast(function () {
            return new Subject();
        });
        connectable.subscribe(function (x) {
            results1.push(x);
        });
        connectable.subscribe(function (x) {
            results2.push(x);
        });
        expect(results1).toEqual([]);
        expect(results2).toEqual([]);
        connectable.connect();
        expect(results1).toEqual([1, 2, 3, 4]);
        expect(results1).toEqual([1, 2, 3, 4]);
        expect(subscriptions).toBe(1);
        done();
    });
    it('should remove all subscribers from the subject when disconnected', function (done) {
        var subject = new Subject();
        var expected = [1, 2, 3, 4];
        var i = 0;
        var source = Observable.fromArray([1, 2, 3, 4]).multicast(subject);
        source.subscribe(function (x) {
            expect(x).toBe(expected[i++]);
        }, null, function () {
            expect(subject.isUnsubscribed).toBe(true);
            done();
        });
        source.connect();
    });
    describe('when given a subject factory', function () {
        it('should allow you to reconnect by subscribing again', function (done) {
            var expected = [1, 2, 3, 4];
            var i = 0;
            var source = Observable.of(1, 2, 3, 4).multicast(function () { return new Subject(); });
            source.subscribe(function (x) {
                expect(x).toBe(expected[i++]);
            }, null, function () {
                i = 0;
                source.subscribe(function (x) {
                    expect(x).toBe(expected[i++]);
                }, null, done);
                source.connect();
            });
            source.connect();
        });
        it('should not throw ObjectUnsubscribedError when used in ' +
            'a switchMap', function (done) {
            var source = Observable.of(1, 2, 3)
                .multicast(function () { return new Subject(); })
                .refCount();
            var expected = ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3'];
            Observable.of('a', 'b', 'c')
                .switchMap(function (letter) { return source.map(function (n) { return String(letter + n); }); })
                .subscribe(function (x) {
                expect(x).toBe(expected.shift());
            }, done.fail, function () {
                expect(expected.length).toBe(0);
                done();
            });
        });
    });
    describe('when given a subject', function () {
        it('should NOT allow you to reconnect by subscribing again', function (done) {
            var expected = [1, 2, 3, 4];
            var i = 0;
            var source = Observable.of(1, 2, 3, 4).multicast(new Subject());
            source.subscribe(function (x) {
                expect(x).toBe(expected[i++]);
            }, null, function () {
                source.subscribe(function (x) {
                    done.fail('this should not be called');
                }, null, done);
                source.connect();
            });
            source.connect();
        });
        it('should not throw ObjectUnsubscribedError when used in ' +
            'a switchMap', function (done) {
            var source = Observable.of(1, 2, 3)
                .multicast(new Subject())
                .refCount();
            var expected = ['a1', 'a2', 'a3'];
            Observable.of('a', 'b', 'c')
                .switchMap(function (letter) { return source.map(function (n) { return String(letter + n); }); })
                .subscribe(function (x) {
                expect(x).toBe(expected.shift());
            }, done.fail, function () {
                expect(expected.length).toBe(0);
                done();
            });
        });
    });
});
//# sourceMappingURL=multicast-spec.js.map