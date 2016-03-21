"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {bufferCount} */
describe('Observable.prototype.bufferCount', function () {
    asDiagram('bufferCount(3,2)')('should emit buffers at intervals', function () {
        var values = {
            v: ['a', 'b', 'c'],
            w: ['c', 'd', 'e'],
            x: ['e', 'f', 'g'],
            y: ['g', 'h', 'i'],
            z: ['i']
        };
        var e1 = hot('--a--b--c--d--e--f--g--h--i--|');
        var expected = '--------v-----w-----x-----y--(z|)';
        expectObservable(e1.bufferCount(3, 2)).toBe(expected, values);
    });
    it('should emit buffers at buffersize of intervals if not specified', function () {
        var values = {
            x: ['a', 'b'],
            y: ['c', 'd'],
            z: ['e', 'f']
        };
        var e1 = hot('--a--b--c--d--e--f--|');
        var expected = '-----x-----y-----z--|';
        expectObservable(e1.bufferCount(2)).toBe(expected, values);
    });
    it('should emit partial buffers if source completes before reaching specified buffer count', function () {
        var e1 = hot('--a--b--c--d--|');
        var expected = '--------------(x|)';
        expectObservable(e1.bufferCount(5)).toBe(expected, { x: ['a', 'b', 'c', 'd'] });
    });
    it('should emit full buffer then last partial buffer if source completes', function () {
        var e1 = hot('--a^-b--c--d--e--|');
        var e1subs = '^             !';
        var expected = '--------y-----(z|)';
        expectObservable(e1.bufferCount(3)).toBe(expected, { y: ['b', 'c', 'd'], z: ['e'] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit buffers at intervals, but stop when result is unsubscribed early', function () {
        var values = {
            v: ['a', 'b', 'c'],
            w: ['c', 'd', 'e']
        };
        var e1 = hot('--a--b--c--d--e--f--g--h--i--|');
        var unsub = '                  !           ';
        var subs = '^                 !           ';
        var expected = '--------v-----w----           ';
        expectObservable(e1.bufferCount(3, 2), unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var values = {
            v: ['a', 'b', 'c'],
            w: ['c', 'd', 'e']
        };
        var e1 = hot('--a--b--c--d--e--f--g--h--i--|');
        var subs = '^                 !           ';
        var expected = '--------v-----w----           ';
        var unsub = '                  !           ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .bufferCount(3, 2)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should raise error if source raise error before reaching specified buffer count', function () {
        var e1 = hot('--a--b--c--d--#');
        var e1subs = '^             !';
        var expected = '--------------#';
        expectObservable(e1.bufferCount(5)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit buffers with specified skip count when skip count is less than window count', function () {
        var values = {
            v: ['a', 'b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['c', 'd', 'e'],
            y: ['d', 'e'],
            z: ['e']
        };
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var expected = '--------v--w--x--(yz|)';
        expectObservable(e1.bufferCount(3, 1)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit buffers with specified skip count when skip count is more than window count', function () {
        var e1 = hot('--a--b--c--d--e--|');
        var e1subs = '^                !';
        var expected = '-----y--------z--|';
        var values = {
            y: ['a', 'b'],
            z: ['d', 'e']
        };
        expectObservable(e1.bufferCount(2, 3)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=bufferCount-spec.js.map