"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {defaultIfEmpty} */
describe('Observable.prototype.defaultIfEmpty', function () {
    asDiagram('defaultIfEmpty(42)')('should return the Observable if not empty with a default value', function () {
        var e1 = hot('--------|');
        var expected = '--------(x|)';
        expectObservable(e1.defaultIfEmpty(42)).toBe(expected, { x: 42 });
    });
    it('should return the argument if Observable is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '(x|)';
        expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return null if the Observable is empty and no arguments', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '(x|)';
        expectObservable(e1.defaultIfEmpty()).toBe(expected, { x: null });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return the Observable if not empty with a default value', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^       !';
        var expected = '--a--b--|';
        expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return the Observable if not empty with no default value', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^       !';
        var expected = '--a--b--|';
        expectObservable(e1.defaultIfEmpty()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^   !    ';
        var expected = '--a--    ';
        var unsub = '    !    ';
        var result = e1.defaultIfEmpty('x');
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var e1 = hot('--a--b--|');
        var e1subs = '^   !    ';
        var expected = '--a--    ';
        var unsub = '    !    ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .defaultIfEmpty('x')
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should error if the Observable errors', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=defaultIfEmpty-spec.js.map