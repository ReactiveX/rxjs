"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
describe('Observable.onErrorResumeNext', function () {
    it('should continue with observables', function () {
        var source = hot('--a--b--#');
        var next1 = cold('--c--d--#');
        var next2 = cold('--e--#');
        var next3 = cold('--f--g--|');
        var subs = '^                            !';
        var expected = '--a--b----c--d----e----f--g--|';
        expectObservable(Observable.onErrorResumeNext(source, next1, next2, next3)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should continue array of observables', function () {
        var source = hot('--a--b--#');
        var next = [source,
            cold('--c--d--#'),
            cold('--e--#'),
            cold('--f--g--|')];
        var subs = '^                            !';
        var expected = '--a--b----c--d----e----f--g--|';
        expectObservable(Observable.onErrorResumeNext(next)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should complete single observable throws', function () {
        var source = hot('#');
        var subs = '(^!)';
        var expected = '|';
        expectObservable(Observable.onErrorResumeNext(source)).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
});
//# sourceMappingURL=onErrorResumeNext-spec.js.map