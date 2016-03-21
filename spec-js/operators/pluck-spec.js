"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {pluck} */
describe('Observable.prototype.pluck', function () {
    it('should work for one object', function () {
        var a = cold('--x--|', { x: { prop: 42 } });
        var asubs = '^    !';
        var expected = '--y--|';
        var r = a.pluck('prop');
        expectObservable(r).toBe(expected, { y: 42 });
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should work for multiple objects', function () {
        var inputs = {
            a: { prop: '1' },
            b: { prop: '2' },
            c: { prop: '3' },
            d: { prop: '4' },
            e: { prop: '5' },
        };
        var a = cold('--a-b--c-d---e-|', inputs);
        var asubs = '^              !';
        var expected = '--1-2--3-4---5-|';
        var r = a.pluck('prop');
        expectObservable(r).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should work with deep nested properties', function () {
        var inputs = {
            a: { a: { b: { c: '1' } } },
            b: { a: { b: { c: '2' } } },
            c: { a: { b: { c: '3' } } },
            d: { a: { b: { c: '4' } } },
            e: { a: { b: { c: '5' } } },
        };
        var a = cold('--a-b--c-d---e-|', inputs);
        var asubs = '^              !';
        var expected = '--1-2--3-4---5-|';
        var r = a.pluck('a', 'b', 'c');
        expectObservable(r).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should work with edge cases of deep nested properties', function () {
        var inputs = {
            a: { a: { b: { c: 1 } } },
            b: { a: { b: 2 } },
            c: { a: { c: { c: 3 } } },
            d: {},
            e: { a: { b: { c: 5 } } },
        };
        var a = cold('--a-b--c-d---e-|', inputs);
        var asubs = '^              !';
        var expected = '--r-x--y-z---w-|';
        var values = { r: 1, x: undefined, y: undefined, z: undefined, w: 5 };
        var r = a.pluck('a', 'b', 'c');
        expectObservable(r).toBe(expected, values);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should throw an error if not property is passed', function () {
        expect(function () {
            Observable.of({ prop: 1 }, { prop: 2 }).pluck();
        }).toThrow(new Error('List of properties cannot be empty.'));
    });
    it('should propagate errors from observable that emits only errors', function () {
        var a = cold('#');
        var asubs = '(^!)';
        var expected = '#';
        var r = a.pluck('whatever');
        expectObservable(r).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should propagate errors from observable that emit values', function () {
        var a = cold('--a--b--#', { a: { prop: '1' }, b: { prop: '2' } }, 'too bad');
        var asubs = '^       !';
        var expected = '--1--2--#';
        var r = a.pluck('prop');
        expectObservable(r).toBe(expected, undefined, 'too bad');
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should not pluck an empty observable', function () {
        var a = cold('|');
        var asubs = '(^!)';
        var expected = '|';
        var invoked = 0;
        var r = a
            .pluck('whatever')
            .do(null, null, function () {
            expect(invoked).toBe(0);
        });
        expectObservable(r).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var a = cold('--a--b--c--|', { a: { prop: '1' }, b: { prop: '2' } });
        var unsub = '      !     ';
        var asubs = '^     !     ';
        var expected = '--1--2-     ';
        var r = a.pluck('prop');
        expectObservable(r, unsub).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should pluck twice', function () {
        var inputs = {
            a: { a: { b: { c: '1' } } },
            b: { a: { b: { c: '2' } } },
            c: { a: { b: { c: '3' } } },
            d: { a: { b: { c: '4' } } },
            e: { a: { b: { c: '5' } } },
        };
        var a = cold('--a-b--c-d---e-|', inputs);
        var asubs = '^              !';
        var expected = '--1-2--3-4---5-|';
        var r = a.pluck('a', 'b').pluck('c');
        expectObservable(r).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var a = cold('--a--b--c--|', { a: { prop: '1' }, b: { prop: '2' } });
        var unsub = '      !     ';
        var asubs = '^     !     ';
        var expected = '--1--2-     ';
        var r = a
            .mergeMap(function (x) { return Observable.of(x); })
            .pluck('prop')
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(r, unsub).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
    });
});
//# sourceMappingURL=pluck-spec.js.map