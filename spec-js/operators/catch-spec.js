"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {catch} */
describe('Observable.prototype.catch', function () {
    asDiagram('catch')('should catch error and replace with a cold Observable', function () {
        var e1 = hot('--a--b--#        ');
        var e2 = cold('-1-2-3-|         ');
        var expected = '--a--b---1-2-3-|)';
        var result = e1.catch(function (err) { return e2; });
        expectObservable(result).toBe(expected);
    });
    it('should catch error and replace it with Observable.of()', function () {
        var e1 = hot('--a--b--c--------|');
        var subs = '^       !';
        var expected = '--a--b--(XYZ|)';
        var result = e1
            .map(function (n) {
            if (n === 'c') {
                throw 'bad';
            }
            return n;
        })
            .catch(function (err) {
            return Observable.of('X', 'Y', 'Z');
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should catch error and replace it with a cold Observable', function () {
        var e1 = hot('--a--b--#          ');
        var e1subs = '^       !          ';
        var e2 = cold('1-2-3-4-5-|');
        var e2subs = '        ^         !';
        var expected = '--a--b--1-2-3-4-5-|';
        var result = e1.catch(function (err) { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing explicitly and early', function () {
        var e1 = hot('--1-2-3-4-5-6---#');
        var e1subs = '^      !         ';
        var expected = '--1-2-3-         ';
        var unsub = '       !         ';
        var result = e1.catch(function () {
            return Observable.of('X', 'Y', 'Z');
        });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var e1 = hot('--1-2-3-4-5-6---#');
        var e1subs = '^      !         ';
        var expected = '--1-2-3-         ';
        var unsub = '       !         ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .catch(function () {
            return Observable.of('X', 'Y', 'Z');
        })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should catch error and replace it with a hot Observable', function () {
        var e1 = hot('--a--b--#          ');
        var e1subs = '^       !          ';
        var e2 = hot('1-2-3-4-5-6-7-8-9-|');
        var e2subs = '        ^         !';
        var expected = '--a--b--5-6-7-8-9-|';
        var result = e1.catch(function (err) { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should catch and allow the cold observable to be repeated with the third ' +
        '(caught) argument', function () {
        var e1 = cold('--a--b--c--------|       ');
        var subs = ['^       !                ',
            '        ^       !        ',
            '                ^       !'];
        var expected = '--a--b----a--b----a--b--#';
        var retries = 0;
        var result = e1
            .map(function (n) {
            if (n === 'c') {
                throw 'bad';
            }
            return n;
        })
            .catch(function (err, caught) {
            if (retries++ === 2) {
                throw 'done';
            }
            return caught;
        });
        expectObservable(result).toBe(expected, undefined, 'done');
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should catch and allow the hot observable to proceed with the third ' +
        '(caught) argument', function () {
        var e1 = hot('--a--b--c----d---|');
        var subs = ['^       !         ',
            '        ^        !'];
        var expected = '--a--b-------d---|';
        var retries = 0;
        var result = e1
            .map(function (n) {
            if (n === 'c') {
                throw 'bad';
            }
            return n;
        })
            .catch(function (err, caught) {
            if (retries++ === 2) {
                throw 'done';
            }
            return caught;
        });
        expectObservable(result).toBe(expected, undefined, 'done');
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should catch and replace a Observable.throw() as the source', function () {
        var e1 = cold('#');
        var subs = '(^!)';
        var expected = '(abc|)';
        var result = e1.catch(function (err) { return Observable.of('a', 'b', 'c'); });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should mirror the source if it does not raise errors', function () {
        var e1 = cold('--a--b--c--|');
        var subs = '^          !';
        var expected = '--a--b--c--|';
        var result = e1.catch(function (err) { return Observable.of('x', 'y', 'z'); });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should complete if you return Observable.empty()', function () {
        var e1 = hot('--a--b--#');
        var e1subs = '^       !';
        var e2 = cold('|');
        var e2subs = '        (^!)';
        var expected = '--a--b--|';
        var result = e1.catch(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error if you return Observable.throw()', function () {
        var e1 = hot('--a--b--#');
        var e1subs = '^       !';
        var e2 = cold('#');
        var e2subs = '        (^!)';
        var expected = '--a--b--#';
        var result = e1.catch(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should never terminate if you return Observable.never()', function () {
        var e1 = hot('--a--b--#');
        var e1subs = '^       !';
        var e2 = cold('-');
        var e2subs = '        ^';
        var expected = '--a--b---';
        var result = e1.catch(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should pass the error as the first argument', function (done) {
        Observable.throw('bad')
            .catch(function (err) {
            expect(err).toBe('bad');
            return Observable.empty();
        })
            .subscribe(function () {
            //noop
        }, function (err) {
            done.fail('should not be called');
        }, done);
    });
});
//# sourceMappingURL=catch-spec.js.map