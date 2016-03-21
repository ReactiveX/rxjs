"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {refCount} */
describe('ConnectableObservable.prototype.refCount', function () {
    asDiagram('refCount')('should turn a multicasted Observable an automatically ' +
        '(dis)connecting hot one', function () {
        var source = cold('--1-2---3-4--5-|');
        var sourceSubs = '^              !';
        var expected = '--1-2---3-4--5-|';
        var result = source.publish().refCount();
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
    it('should count references', function () {
        var source = Observable.never().publish().refCount();
        var sub1 = source.subscribe({ next: function () {
            } });
        var sub2 = source.subscribe({ next: function () {
            } });
        var sub3 = source.subscribe({ next: function () {
            } });
        expect(source.refCount).toBe(3);
        sub1.unsubscribe();
        sub2.unsubscribe();
        sub3.unsubscribe();
    });
    it('should unsub from the source when all other subscriptions are unsubbed', function (done) {
        var unsubscribeCalled = false;
        var source = new Observable(function (observer) {
            observer.next(true);
            return function () {
                unsubscribeCalled = true;
            };
        }).publish().refCount();
        var sub1 = source.subscribe(function () {
            //noop
        });
        var sub2 = source.subscribe(function () {
            //noop
        });
        var sub3 = source.subscribe(function (x) {
            expect(source.refCount).toBe(1);
        });
        sub1.unsubscribe();
        sub2.unsubscribe();
        sub3.unsubscribe();
        expect(source.refCount).toBe(0);
        expect(unsubscribeCalled).toBe(true);
        done();
    });
});
//# sourceMappingURL=refCount-spec.js.map