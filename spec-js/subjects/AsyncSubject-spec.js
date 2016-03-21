"use strict";
var Rx = require('../../dist/cjs/Rx');
var AsyncSubject = Rx.AsyncSubject;
var TestObserver = (function () {
    function TestObserver() {
        this.results = [];
    }
    TestObserver.prototype.next = function (value) {
        this.results.push(value);
    };
    TestObserver.prototype.error = function (err) {
        this.results.push(err);
    };
    TestObserver.prototype.complete = function () {
        this.results.push('done');
    };
    return TestObserver;
}());
/** @test {AsyncSubject} */
describe('AsyncSubject', function () {
    it('should emit the last value when complete', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.next(2);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual([2, 'done']);
    });
    it('should emit the last value when subscribing after complete', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.next(1);
        subject.next(2);
        subject.complete();
        subject.subscribe(observer);
        expect(observer.results).toEqual([2, 'done']);
    });
    it('should keep emitting the last value to subsequent subscriptions', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        var subscription = subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.next(2);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual([2, 'done']);
        subscription.unsubscribe();
        observer.results = [];
        subject.subscribe(observer);
        expect(observer.results).toEqual([2, 'done']);
    });
    it('should not emit values after complete', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.next(2);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual([2, 'done']);
    });
    it('should not emit values if unsubscribed before complete', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        var subscription = subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.next(2);
        expect(observer.results).toEqual([]);
        subscription.unsubscribe();
        subject.next(3);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual([]);
    });
    it('should just complete if no value has been nexted into it', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.subscribe(observer);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual(['done']);
    });
    it('should keep emitting complete to subsequent subscriptions', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        var subscription = subject.subscribe(observer);
        expect(observer.results).toEqual([]);
        subject.complete();
        expect(observer.results).toEqual(['done']);
        subscription.unsubscribe();
        observer.results = [];
        subject.subscribe(observer);
        expect(observer.results).toEqual(['done']);
    });
    it('should only error if an error is passed into it', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.error(new Error('bad'));
        expect(observer.results).toEqual([new Error('bad')]);
    });
    it('should keep emitting error to subsequent subscriptions', function () {
        var subject = new AsyncSubject();
        var observer = new TestObserver();
        subject.subscribe(observer);
        subject.next(1);
        expect(observer.results).toEqual([]);
        subject.error(new Error('bad'));
        expect(observer.results).toEqual([new Error('bad')]);
        subject.unsubscribe();
        observer.results = [];
        subject.subscribe(observer);
        expect(observer.results).toEqual([new Error('bad')]);
    });
});
//# sourceMappingURL=AsyncSubject-spec.js.map