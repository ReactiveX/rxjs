"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {scan} */
describe('Observable.prototype.scan', function () {
    asDiagram('scan((acc, curr) => acc + curr, 0)')('should scan', function () {
        var values = {
            a: 1, b: 3, c: 5,
            x: 1, y: 4, z: 9
        };
        var e1 = hot('--a--b--c--|', values);
        var e1subs = '^          !';
        var expected = '--x--y--z--|';
        var scanFunction = function (o, x) {
            return o + x;
        };
        expectObservable(e1.scan(scanFunction, 0)).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should scan things', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                    !';
        var expected = '---u--v--w--x--y--z--|';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should scan without seed', function () {
        var e1 = hot('--a--^--b--c--d--|');
        var e1subs = '^           !';
        var expected = '---x--y--z--|';
        var values = {
            x: 'b',
            y: 'bc',
            z: 'bcd'
        };
        var source = e1.scan(function (acc, x) { return acc + x; });
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle errors', function () {
        var e1 = hot('--a--^--b--c--d--#');
        var e1subs = '^           !';
        var expected = '---u--v--w--#';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd']
        };
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle errors in the projection function', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^        !            ';
        var expected = '---u--v--#            ';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.scan(function (acc, x) {
            if (x === 'd') {
                throw 'bad!';
            }
            return [].concat(acc, x);
        }, []);
        expectObservable(source).toBe(expected, values, 'bad!');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '|';
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle throw', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var unsub = '              !       ';
        var e1subs = '^             !       ';
        var expected = '---u--v--w--x--       ';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.scan(function (acc, x) { return [].concat(acc, x); }, []);
        expectObservable(source, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^             !       ';
        var expected = '---u--v--w--x--       ';
        var unsub = '              !       ';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .scan(function (acc, x) { return [].concat(acc, x); }, [])
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(source, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=scan-spec.js.map