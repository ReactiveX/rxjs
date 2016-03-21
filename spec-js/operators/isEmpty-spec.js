"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
/** @test {isEmpty} */
describe('Observable.prototype.isEmpty', function () {
    asDiagram('isEmpty')('should return true if source is empty', function () {
        var source = hot('-----|');
        var subs = '^    !';
        var expected = '-----(T|)';
        expectObservable(source.isEmpty()).toBe(expected, { T: true });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return false if source emits element', function () {
        var source = hot('--a--^--b--|');
        var subs = '^  !';
        var expected = '---(F|)';
        expectObservable(source.isEmpty()).toBe(expected, { F: false });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should raise error if source raise error', function () {
        var source = hot('--#');
        var subs = '^ !';
        var expected = '--#';
        expectObservable(source.isEmpty()).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not completes if source never emits', function () {
        var source = cold('-');
        var subs = '^';
        var expected = '-';
        expectObservable(source.isEmpty()).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return true if source is Observable.empty()', function () {
        var source = cold('|');
        var subs = '(^!)';
        var expected = '(T|)';
        expectObservable(source.isEmpty()).toBe(expected, { T: true });
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var source = cold('-----------a--b--|');
        var unsub = '      !           ';
        var subs = '^     !           ';
        var expected = '-------           ';
        expectObservable(source.isEmpty(), unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var source = cold('-----------a--b--|');
        var subs = '^     !           ';
        var expected = '-------           ';
        var unsub = '      !           ';
        var result = source
            .mergeMap(function (x) { return Rx.Observable.of(x); })
            .isEmpty()
            .mergeMap(function (x) { return Rx.Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
});
//# sourceMappingURL=isEmpty-spec.js.map