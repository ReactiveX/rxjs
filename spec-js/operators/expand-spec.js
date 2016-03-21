"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {expand} */
describe('Observable.prototype.expand', function () {
    it('should map and recursively flatten', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '^           !   ';
        var e2shape = '---(z|)         ';
        var expected = 'a--b--c--d--(e|)';
        /*
          expectation explanation: (conjunction junction?) ...
    
          since `cold('---(z|)')` emits `x + x` and completes on frame 30
          but the next "expanded" return value is synchronously subscribed to in
          that same frame, it stacks like so:
    
          a
          ---(b|)
             ---(c|)
                ---(d|)
                   ---(e|)      (...which flattens into:)
          a--b--c--d--(e|)
        */
        var result = e1.expand(function (x, index) {
            if (x === 16) {
                return Observable.empty();
            }
            else {
                return cold(e2shape, { z: x + x });
            }
        });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should map and recursively flatten, and handle event raised error', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '^        !   ';
        var e2shape = '---(z|)      ';
        var expected = 'a--b--c--(d#)';
        var result = e1.expand(function (x) {
            if (x === 8) {
                return cold('#');
            }
            return cold(e2shape, { z: x + x });
        });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should map and recursively flatten, and propagate error thrown from projection', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '^        !   ';
        var e2shape = '---(z|)      ';
        var expected = 'a--b--c--(d#)';
        var result = e1.expand(function (x) {
            if (x === 8) {
                throw 'error';
            }
            return cold(e2shape, { z: x + x });
        });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow unsubscribing early', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var unsub = '       !  ';
        var e1subs = '^      !  ';
        var e2shape = '---(z|)   ';
        var expected = 'a--b--c-  ';
        var result = e1.expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '^      !  ';
        var e2shape = '---(z|)   ';
        var expected = 'a--b--c-  ';
        var unsub = '       !  ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow concurrent expansions', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('a-a|              ', values);
        var e1subs = '^             !   ';
        var e2shape = '---(z|)           ';
        var expected = 'a-ab-bc-cd-de-(e|)';
        var result = e1.expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow configuring the concurrency limit parameter to 1', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
            u: 10,
            v: 20,
            x: 40,
            y: 80,
            z: 160,
        };
        var e1 = hot('a-u|', values);
        var e2shape = '---(z|)';
        //                 ---(z|)
        //                    ---(z|)
        //                       ---(z|)
        //                          ---(z|)
        //                             ---(z|)
        //                                ---(z|)
        //                                   ---(z|)
        // Notice how for each column, there is at most 1 `-` character.
        var e1subs = '^                       !    ';
        var expected = 'a--u--b--v--c--x--d--y--(ez|)';
        var concurrencyLimit = 1;
        var result = e1.expand(function (x) {
            if (x === 16 || x === 160) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        }, concurrencyLimit);
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should allow configuring the concurrency limit parameter to 2', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            u: 10,
            v: 20,
            x: 40,
        };
        var e1 = hot('a---au|', values);
        var e2shape = '------(z|)';
        //                  ------(z|)
        //                    ------(z|)
        //                        ------(z|)
        //                          ------(z|)
        //                              ------(z|)
        //                                ------(z|)
        // Notice how for each column, there is at most 2 `-` characters.
        var e1subs = '^                     !   ';
        var expected = 'a---a-u---b-b---v-(cc)(x|)';
        var concurrencyLimit = 2;
        var result = e1.expand(function (x) {
            if (x === 4 || x === 40) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        }, concurrencyLimit);
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should ignore concurrency limit if it is not passed', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
            u: 10,
            v: 20,
            x: 40,
            y: 80,
            z: 160,
        };
        var e1 = hot('a-u|              ', values);
        var e1subs = '^             !   ';
        var e2shape = '---(z|)           ';
        var expected = 'a-ub-vc-xd-ye-(z|)';
        var concurrencyLimit = 100;
        var result = e1.expand(function (x) {
            if (x === 16 || x === 160) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        }, concurrencyLimit);
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should map and recursively flatten with scalars', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '(^!)';
        var expected = '(abcde|)';
        var result = e1.expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return Observable.of(x + x); // scalar
        });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should recursively flatten promises', function (done) {
        var expected = [1, 2, 4, 8, 16];
        Observable.of(1)
            .expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return Promise.resolve(x + x);
        })
            .subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, null, function () {
            expect(expected.length).toBe(0);
            done();
        });
    });
    it('should recursively flatten Arrays', function (done) {
        var expected = [1, 2, 4, 8, 16];
        Observable.of(1)
            .expand(function (x) {
            if (x === 16) {
                return Observable.empty();
            }
            return [x + x];
        })
            .subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, null, function () {
            expect(expected.length).toBe(0);
            done();
        });
    });
    it('should recursively flatten lowercase-o observables', function (done) {
        var expected = [1, 2, 4, 8, 16];
        var project = function (x, index) {
            if (x === 16) {
                return Observable.empty();
            }
            var ish = {
                subscribe: function (observer) {
                    observer.next(x + x);
                    observer.complete();
                }
            };
            ish[Symbol.observable] = function () {
                return this;
            };
            return ish;
        };
        Observable.of(1)
            .expand(project)
            .subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, null, function () {
            expect(expected.length).toBe(0);
            done();
        });
    });
    it('should work when passing undefined for the optional arguments', function () {
        var values = {
            a: 1,
            b: 1 + 1,
            c: 2 + 2,
            d: 4 + 4,
            e: 8 + 8,
        };
        var e1 = hot('(a|)', values);
        var e1subs = '^           !   ';
        var e2shape = '---(z|)         ';
        var expected = 'a--b--c--d--(e|)';
        var project = function (x, index) {
            if (x === 16) {
                return Observable.empty();
            }
            return cold(e2shape, { z: x + x });
        };
        var result = e1.expand(project, undefined, undefined);
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
});
//# sourceMappingURL=expand-spec.js.map