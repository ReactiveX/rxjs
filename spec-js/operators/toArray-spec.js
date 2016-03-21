"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {toArray} */
describe('Observable.prototype.toArray', function () {
    asDiagram('toArray')('should reduce the values of an observable into an array', function () {
        var e1 = hot('---a--b--|');
        var e1subs = '^        !';
        var expected = '---------(w|)';
        expectObservable(e1.toArray()).toBe(expected, { w: ['a', 'b'] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should be never when source is never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        expectObservable(e1.toArray()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should be never when source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '(w|)';
        expectObservable(e1.toArray()).toBe(expected, { w: [] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should be never when source doesn\'t complete', function () {
        var e1 = hot('--x--^--y--');
        var e1subs = '^     ';
        var expected = '------';
        expectObservable(e1.toArray()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should reduce observable without values into an array of length zero', function () {
        var e1 = hot('-x-^---|');
        var e1subs = '^   !';
        var expected = '----(w|)';
        expectObservable(e1.toArray()).toBe(expected, { w: [] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should reduce the a single value of an observable into an array', function () {
        var e1 = hot('-x-^--y--|');
        var e1subs = '^     !';
        var expected = '------(w|)';
        expectObservable(e1.toArray()).toBe(expected, { w: ['y'] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--b----c-----d----e---|');
        var unsub = '        !                 ';
        var e1subs = '^       !                 ';
        var expected = '---------                 ';
        expectObservable(e1.toArray(), unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--b----c-----d----e---|');
        var e1subs = '^       !                 ';
        var expected = '---------                 ';
        var unsub = '        !                 ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .toArray()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with error', function () {
        var e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
        var e1subs = '^        !';
        var expected = '---------#';
        expectObservable(e1.toArray()).toBe(expected, null, 'too bad');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with throw', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        expectObservable(e1.toArray()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    type(function () {
        var typeValue = {
            val: 3
        };
        Observable.of(typeValue).toArray().subscribe(function (x) { x[0].val.toString(); });
    });
});
//# sourceMappingURL=toArray-spec.js.map