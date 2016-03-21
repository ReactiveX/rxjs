"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {partition} */
describe('Observable.prototype.partition', function () {
    function expectObservableArray(result, expected) {
        for (var idx = 0; idx < result.length; idx++) {
            expectObservable(result[idx]).toBe(expected[idx]);
        }
    }
    asDiagram('partition(x => x % 2 === 1)')('should partition an observable of ' +
        'integers into even and odd', function () {
        var e1 = hot('--1-2---3------4--5---6--|');
        var e1subs = '^                        !';
        var expected = ['--1-----3---------5------|',
            '----2----------4------6--|'];
        var result = e1.partition(function (x) { return x % 2 === 1; });
        expectObservableArray(result, expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition an observable into two using a predicate', function () {
        var e1 = hot('--a-b---a------d--a---c--|');
        var e1subs = '^                        !';
        var expected = ['--a-----a---------a------|',
            '----b----------d------c--|'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should pass errors to both returned observables', function () {
        var e1 = hot('--a-b---#');
        var e1subs = '^       !';
        var expected = ['--a-----#',
            '----b---#'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should pass errors to both returned observables if source throws', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = ['#',
            '#'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should pass errors to both returned observables if predicate throws', function () {
        var e1 = hot('--a-b--a--|');
        var e1subs = '^      !   ';
        var expected = ['--a----#   ',
            '----b--#   '];
        var index = 0;
        var error = 'error';
        function predicate(x) {
            var match = x === 'a';
            if (match && index++ > 1) {
                throw error;
            }
            return match;
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition empty observable if source does not emits', function () {
        var e1 = hot('----|');
        var e1subs = '^   !';
        var expected = ['----|',
            '----|'];
        function predicate(x) {
            return x === 'x';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition empty observable if source is empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = ['|',
            '|'];
        function predicate(x) {
            return x === 'x';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition if source emits single elements', function () {
        var e1 = hot('--a--|');
        var e1subs = '^    !';
        var expected = ['--a--|',
            '-----|'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition if predicate matches all of source elements', function () {
        var e1 = hot('--a--a--a--a--a--a--a--|');
        var e1subs = '^                      !';
        var expected = ['--a--a--a--a--a--a--a--|',
            '-----------------------|'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition if predicate does not match all of source elements', function () {
        var e1 = hot('--b--b--b--b--b--b--b--|');
        var e1subs = '^                      !';
        var expected = ['-----------------------|',
            '--b--b--b--b--b--b--b--|'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition to infinite observable if source does not completes', function () {
        var e1 = hot('--a-b---a------d----');
        var e1subs = '^                   ';
        var expected = ['--a-----a-----------',
            '----b----------d----'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition to infinite observable if source never completes', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = ['-',
            '-'];
        function predicate(x) {
            return x === 'a';
        }
        expectObservableArray(e1.partition(predicate), expected);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should partition into two observable with early unsubscription', function () {
        var e1 = hot('--a-b---a------d-|');
        var unsub = '       !          ';
        var e1subs = '^      !          ';
        var expected = ['--a-----          ',
            '----b---          '];
        function predicate(x) {
            return x === 'a';
        }
        var result = e1.partition(predicate);
        for (var idx = 0; idx < result.length; idx++) {
            expectObservable(result[idx], unsub).toBe(expected[idx]);
        }
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a-b---a------d-|');
        var e1subs = '^      !          ';
        var expected = ['--a-----          ',
            '----b---          '];
        var unsub = '       !          ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .partition(function (x) { return x === 'a'; })
            .map(function (observable) {
            return observable.mergeMap(function (x) { return Observable.of(x); });
        });
        expectObservable(result[0], unsub).toBe(expected[0]);
        expectObservable(result[1], unsub).toBe(expected[1]);
        expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
    it('should throw without predicate', function () {
        var e1 = hot('--a-b---a------d----');
        expect(e1.partition).toThrow();
    });
});
//# sourceMappingURL=partition-spec.js.map