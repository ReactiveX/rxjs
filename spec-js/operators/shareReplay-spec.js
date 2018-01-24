"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chai_1 = require('chai');
var Rx = require('../../dist/package/Rx');
var Observable = Rx.Observable;
/** @test {shareReplay} */
describe('Observable.prototype.shareReplay', function () {
    it('should mirror a simple source Observable', function () {
        var source = cold('--1-2---3-4--5-|');
        var sourceSubs = '^              !';
        var published = source.shareReplay();
        var expected = '--1-2---3-4--5-|';
        expectObservable(published).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should do nothing if result is not subscribed', function () {
        var subscribed = false;
        var source = new Observable(function () {
            subscribed = true;
        });
        source.shareReplay();
        chai_1.expect(subscribed).to.be.false;
    });
    it('should multicast the same values to multiple observers, bufferSize=1', function () {
        var source = cold('-1-2-3----4-|');
        var shared = source.shareReplay(1);
        var sourceSubs = '^           !';
        var subscriber1 = hot('a|           ').mergeMapTo(shared);
        var expected1 = '-1-2-3----4-|';
        var subscriber2 = hot('    b|       ').mergeMapTo(shared);
        var expected2 = '    23----4-|';
        var subscriber3 = hot('        c|   ').mergeMapTo(shared);
        var expected3 = '        3-4-|';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast the same values to multiple observers, bufferSize=2', function () {
        var source = cold('-1-2-----3------4-|');
        var shared = source.shareReplay(2);
        var sourceSubs = '^                 !';
        var subscriber1 = hot('a|                 ').mergeMapTo(shared);
        var expected1 = '-1-2-----3------4-|';
        var subscriber2 = hot('    b|             ').mergeMapTo(shared);
        var expected2 = '    (12)-3------4-|';
        var subscriber3 = hot('           c|       ').mergeMapTo(shared);
        var expected3 = '           (23)-4-|';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast an error from the source to multiple observers', function () {
        var source = cold('-1-2-3----4-#');
        var shared = source.shareReplay(1);
        var sourceSubs = '^           !';
        var subscriber1 = hot('a|           ').mergeMapTo(shared);
        var expected1 = '-1-2-3----4-#';
        var subscriber2 = hot('    b|       ').mergeMapTo(shared);
        var expected2 = '    23----4-#';
        var subscriber3 = hot('        c|   ').mergeMapTo(shared);
        var expected3 = '        3-4-#';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast an empty source', function () {
        var source = cold('|');
        var sourceSubs = '(^!)';
        var shared = source.shareReplay(1);
        var expected = '|';
        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast a never source', function () {
        var source = cold('-');
        var sourceSubs = '^';
        var shared = source.shareReplay(1);
        var expected = '-';
        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should multicast a throw source', function () {
        var source = cold('#');
        var sourceSubs = '(^!)';
        var shared = source.shareReplay(1);
        var expected = '#';
        expectObservable(shared).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should replay results to subsequent subscriptions if source completes, bufferSize=2', function () {
        var source = cold('-1-2-----3-|        ');
        var shared = source.shareReplay(2);
        var sourceSubs = '^          !        ';
        var subscriber1 = hot('a|                  ').mergeMapTo(shared);
        var expected1 = '-1-2-----3-|        ';
        var subscriber2 = hot('    b|              ').mergeMapTo(shared);
        var expected2 = '    (12)-3-|        ';
        var subscriber3 = hot('               (c|) ').mergeMapTo(shared);
        var expected3 = '               (23|)';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should completely restart for subsequent subscriptions if source errors, bufferSize=2', function () {
        var source = cold('-1-2-----3-#               ');
        var shared = source.shareReplay(2);
        var sourceSubs1 = '^          !               ';
        var subscriber1 = hot('a|                         ').mergeMapTo(shared);
        var expected1 = '-1-2-----3-#               ';
        var subscriber2 = hot('    b|                     ').mergeMapTo(shared);
        var expected2 = '    (12)-3-#               ';
        var subscriber3 = hot('               (c|)        ').mergeMapTo(shared);
        var expected3 = '               -1-2-----3-#';
        var sourceSubs2 = '               ^          !';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe([sourceSubs1, sourceSubs2]);
    });
    it('should be retryable, bufferSize=2', function () {
        var subs = [];
        var source = cold('-1-2-----3-#                      ');
        var shared = source.shareReplay(2).retry(1);
        subs.push('^          !                      ');
        subs.push('           ^          !           ');
        subs.push('                      ^          !');
        var subscriber1 = hot('a|                                ').mergeMapTo(shared);
        var expected1 = '-1-2-----3--1-2-----3-#           ';
        var subscriber2 = hot('    b|                            ').mergeMapTo(shared);
        var expected2 = '    (12)-3--1-2-----3-#           ';
        var subscriber3 = hot('               (c|)               ').mergeMapTo(shared);
        var expected3 = '               (12)-3--1-2-----3-#';
        expectObservable(subscriber1).toBe(expected1);
        expectObservable(subscriber2).toBe(expected2);
        expectObservable(subscriber3).toBe(expected3);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not restart if refCount hits 0 due to unsubscriptions', function () {
        var results = [];
        var source = Rx.Observable.interval(10, rxTestScheduler)
            .take(10)
            .shareReplay(1);
        var subs = source.subscribe(function (x) { return results.push(x); });
        rxTestScheduler.schedule(function () { return subs.unsubscribe(); }, 35);
        rxTestScheduler.schedule(function () { return source.subscribe(function (x) { return results.push(x); }); }, 54);
        rxTestScheduler.flush();
        chai_1.expect(results).to.deep.equal([0, 1, 2, 4, 5, 6, 7, 8, 9]);
    });
    it('should not break lift() composability', function (done) {
        var MyCustomObservable = (function (_super) {
            __extends(MyCustomObservable, _super);
            function MyCustomObservable() {
                _super.apply(this, arguments);
            }
            MyCustomObservable.prototype.lift = function (operator) {
                var observable = new MyCustomObservable();
                observable.source = this;
                observable.operator = operator;
                return observable;
            };
            return MyCustomObservable;
        }(Rx.Observable));
        var result = new MyCustomObservable(function (observer) {
            observer.next(1);
            observer.next(2);
            observer.next(3);
            observer.complete();
        }).shareReplay();
        chai_1.expect(result instanceof MyCustomObservable).to.be.true;
        var expected = [1, 2, 3];
        result
            .subscribe(function (n) {
            chai_1.expect(expected.length).to.be.greaterThan(0);
            chai_1.expect(n).to.equal(expected.shift());
        }, function (x) {
            done(new Error('should not be called'));
        }, function () {
            done();
        });
    });
});
//# sourceMappingURL=shareReplay-spec.js.map