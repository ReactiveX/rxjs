"use strict";
var chai_1 = require('chai');
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
describe('Observable.prototype.onErrorResumeNext', function () {
    asDiagram('onErrorResumeNext')('should continue observable sequence with next observable', function () {
        var source = hot('--a--b--#');
        var next = cold('--c--d--|');
        var subs = '^               !';
        var expected = '--a--b----c--d--|';
        expectObservable(source.onErrorResumeNext(next)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue with hot observables', function () {
        var source = hot('--a--b--#');
        var next = hot('-----x----c--d--|');
        var subs = '^               !';
        var expected = '--a--b----c--d--|';
        expectObservable(source.onErrorResumeNext(next)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue with array of multiple observables throw error', function () {
        var source = hot('--a--b--#');
        var next = [cold('--c--d--#'),
            cold('--e--#'),
            cold('--f--g--|')];
        var subs = '^                            !';
        var expected = '--a--b----c--d----e----f--g--|';
        expectObservable(source.onErrorResumeNext(next)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue with multiple observables throw error', function () {
        var source = hot('--a--b--#');
        var next1 = cold('--c--d--#');
        var next2 = cold('--e--#');
        var next3 = cold('--f--g--|');
        var subs = '^                            !';
        var expected = '--a--b----c--d----e----f--g--|';
        expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue with multiple observables does not throw error', function () {
        var source = hot('--a--b--|');
        var next1 = cold('--c--d--|');
        var next2 = cold('--e--|');
        var next3 = cold('--f--g--|');
        var subs = '^                            !';
        var expected = '--a--b----c--d----e----f--g--|';
        expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue after empty observable', function () {
        var source = hot('|');
        var next1 = cold('--c--d--|');
        var next2 = cold('--e--#');
        var next3 = cold('--f--g--|');
        var subs = '^                    !';
        var expected = '--c--d----e----f--g--|';
        expectObservable(source.onErrorResumeNext(next1, next2, next3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not complete with observble does not ends', function () {
        var source = hot('--a--b--|');
        var next1 = cold('--');
        var subs = '^         ';
        var expected = '--a--b----';
        expectObservable(source.onErrorResumeNext(next1)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not continue with observble does not ends', function () {
        var source = hot('--');
        var next1 = cold('-a--b-');
        var subs = '^       ';
        var expected = '-';
        expectObservable(source.onErrorResumeNext(next1)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should complete observable with next observable throws', function () {
        var source = hot('--a--b--#');
        var next = cold('--c--d--#');
        var subs = '^               !';
        var expected = '--a--b----c--d--|';
        expectObservable(source.onErrorResumeNext(next)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should work with promise', function (done) {
        var expected = [1, 2];
        var source = Observable.concat(Observable.of(1), Observable.throw('meh'));
        source.onErrorResumeNext(Promise.resolve(2))
            .subscribe(function (x) {
            chai_1.expect(expected.shift()).to.equal(x);
        }, function (err) {
            done(new Error('should not be called'));
        }, function () {
            chai_1.expect(expected).to.be.empty;
            done();
        });
    });
});
//# sourceMappingURL=onErrorResumeNext-spec.js.map