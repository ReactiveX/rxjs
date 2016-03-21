"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {fromPromise} */
describe('Observable.fromPromise', function () {
    it('should emit one value from a resolved promise', function (done) {
        var promise = Promise.resolve(42);
        Observable.fromPromise(promise)
            .subscribe(function (x) { expect(x).toBe(42); }, done.fail, done);
    });
    it('should raise error from a rejected promise', function (done) {
        var promise = Promise.reject('bad');
        Observable.fromPromise(promise)
            .subscribe(function (x) {
            done.fail('should not be called');
        }, function (e) {
            expect(e).toBe('bad');
            done();
        }, done.fail);
    });
    it('should share the underlying promise with multiple subscribers', function (done) {
        var promise = Promise.resolve(42);
        var observable = Observable.fromPromise(promise);
        observable
            .subscribe(function (x) { expect(x).toBe(42); }, done.fail, null);
        setTimeout(function () {
            observable
                .subscribe(function (x) { expect(x).toBe(42); }, done.fail, done);
        });
    });
    it('should accept already-resolved Promise', function (done) {
        var promise = Promise.resolve(42);
        promise.then(function (x) {
            expect(x).toBe(42);
            Observable.fromPromise(promise)
                .subscribe(function (y) { expect(y).toBe(42); }, done.fail, done);
        }, done.fail);
    });
    it('should emit a value from a resolved promise on a separate scheduler', function (done) {
        var promise = Promise.resolve(42);
        Observable.fromPromise(promise, Rx.Scheduler.asap)
            .subscribe(function (x) { expect(x).toBe(42); }, done.fail, done);
    });
    it('should raise error from a rejected promise on a separate scheduler', function (done) {
        var promise = Promise.reject('bad');
        Observable.fromPromise(promise, Rx.Scheduler.asap)
            .subscribe(function (x) { done.fail('should not be called'); }, function (e) {
            expect(e).toBe('bad');
            done();
        }, done.fail);
    });
    it('should share the underlying promise with multiple subscribers on a separate scheduler', function (done) {
        var promise = Promise.resolve(42);
        var observable = Observable.fromPromise(promise, Rx.Scheduler.asap);
        observable
            .subscribe(function (x) { expect(x).toBe(42); }, done.fail, null);
        setTimeout(function () {
            observable
                .subscribe(function (x) { expect(x).toBe(42); }, done.fail, done);
        });
    });
    it('should not emit, throw or complete if immediately unsubscribed', function (done) {
        var nextSpy = jasmine.createSpy('next');
        var throwSpy = jasmine.createSpy('throw');
        var completeSpy = jasmine.createSpy('complete');
        var promise = Promise.resolve(42);
        var subscription = Observable.fromPromise(promise)
            .subscribe(nextSpy, throwSpy, completeSpy);
        subscription.unsubscribe();
        setTimeout(function () {
            expect(nextSpy).not.toHaveBeenCalled();
            expect(throwSpy).not.toHaveBeenCalled();
            expect(completeSpy).not.toHaveBeenCalled();
            done();
        });
    });
    if (typeof process === 'object' && Object.prototype.toString.call(process) === '[object process]') {
        it('should globally throw unhandled errors on process', function (done) {
            var invoked = false;
            process.on('uncaughtException', function (reason, p) {
                if (invoked) {
                    return;
                }
                invoked = true;
                expect(reason).toBe('fail');
                done();
            });
            Observable.fromPromise(Promise.reject('bad'))
                .subscribe(function (x) { done.fail('should not be called'); }, function (e) {
                expect(e).toBe('bad');
                throw 'fail';
            }, done.fail);
        });
    }
    else if (typeof window === 'object' && Object.prototype.toString.call(window) === '[object global]') {
        it('should globally throw unhandled errors on window', function (done) {
            var invoked = false;
            function onException(e) {
                if (invoked) {
                    return;
                }
                invoked = true;
                expect(e).toBe('Uncaught fail');
                done();
            }
            window.onerror = onException;
            Observable.fromPromise(Promise.reject('bad'))
                .subscribe(function (x) { done.fail('should not be called'); }, function (e) {
                expect(e).toBe('bad');
                throw 'fail';
            }, done.fail);
        });
    }
});
//# sourceMappingURL=from-promise-spec.js.map