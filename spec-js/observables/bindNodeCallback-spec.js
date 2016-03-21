"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {bindNodeCallback} */
describe('Observable.bindNodeCallback', function () {
    describe('when not scheduled', function () {
        it('should emit one value from a callback', function () {
            function callback(datum, cb) {
                cb(null, datum);
            }
            var boundCallback = Observable.bindNodeCallback(callback);
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                results.push(x);
            }, null, function () {
                results.push('done');
            });
            expect(results).toEqual([42, 'done']);
        });
        it('should emit one value chosen by a selector', function () {
            function callback(datum, cb) {
                cb(null, datum);
            }
            var boundCallback = Observable.bindNodeCallback(callback, function (datum) { return datum; });
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                results.push(x);
            }, null, function () {
                results.push('done');
            });
            expect(results).toEqual([42, 'done']);
        });
        it('should raise error from callback', function () {
            var error = new Error();
            function callback(cb) {
                cb(error);
            }
            var boundCallback = Observable.bindNodeCallback(callback);
            var results = [];
            boundCallback()
                .subscribe(function () {
                throw 'should not next';
            }, function (err) {
                results.push(err);
            }, function () {
                throw 'should not complete';
            });
            expect(results).toEqual([error]);
        });
        it('should emit an error when the selector throws', function () {
            function callback(cb) {
                cb(null, 42);
            }
            var boundCallback = Observable.bindNodeCallback(callback, function (err) { throw new Error('Yikes!'); });
            var results = [];
            boundCallback()
                .subscribe(function () {
                throw 'should not next';
            }, function (err) {
                results.push(err);
            }, function () {
                throw 'should not complete';
            });
            expect(results).toEqual([new Error('Yikes!')]);
        });
        it('should not emit, throw or complete if immediately unsubscribed', function (done) {
            var nextSpy = jasmine.createSpy('next');
            var throwSpy = jasmine.createSpy('throw');
            var completeSpy = jasmine.createSpy('complete');
            var timeout;
            function callback(datum, cb) {
                // Need to cb async in order for the unsub to trigger
                timeout = setTimeout(function () {
                    cb(null, datum);
                });
            }
            var subscription = Observable.bindNodeCallback(callback)(42)
                .subscribe(nextSpy, throwSpy, completeSpy);
            subscription.unsubscribe();
            setTimeout(function () {
                expect(nextSpy).not.toHaveBeenCalled();
                expect(throwSpy).not.toHaveBeenCalled();
                expect(completeSpy).not.toHaveBeenCalled();
                clearTimeout(timeout);
                done();
            });
        });
    });
    describe('when scheduled', function () {
        it('should emit one value from a callback', function () {
            function callback(datum, cb) {
                cb(null, datum);
            }
            var boundCallback = Observable.bindNodeCallback(callback, null, rxTestScheduler);
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                results.push(x);
            }, null, function () {
                results.push('done');
            });
            rxTestScheduler.flush();
            expect(results).toEqual([42, 'done']);
        });
        it('should error if callback throws', function () {
            function callback(datum, cb) {
                throw new Error('haha no callback for you');
            }
            var boundCallback = Observable.bindNodeCallback(callback, null, rxTestScheduler);
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                throw 'should not next';
            }, function (err) {
                results.push(err);
            }, function () {
                throw 'should not complete';
            });
            rxTestScheduler.flush();
            expect(results).toEqual([new Error('haha no callback for you')]);
        });
        it('should raise error from callback', function () {
            var error = new Error();
            function callback(cb) {
                cb(error);
            }
            var boundCallback = Observable.bindNodeCallback(callback, null, rxTestScheduler);
            var results = [];
            boundCallback()
                .subscribe(function () {
                throw 'should not next';
            }, function (err) {
                results.push(err);
            }, function () {
                throw 'should not complete';
            });
            rxTestScheduler.flush();
            expect(results).toEqual([error]);
        });
        it('should error if selector throws', function () {
            function callback(datum, cb) {
                cb(null, datum);
            }
            function selector() {
                throw new Error('what? a selector? I don\'t think so');
            }
            var boundCallback = Observable.bindNodeCallback(callback, selector, rxTestScheduler);
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                throw 'should not next';
            }, function (err) {
                results.push(err);
            }, function () {
                throw 'should not complete';
            });
            rxTestScheduler.flush();
            expect(results).toEqual([new Error('what? a selector? I don\'t think so')]);
        });
        it('should use a selector', function () {
            function callback(datum, cb) {
                cb(null, datum);
            }
            function selector(x) {
                return x + '!!!';
            }
            var boundCallback = Observable.bindNodeCallback(callback, selector, rxTestScheduler);
            var results = [];
            boundCallback(42)
                .subscribe(function (x) {
                results.push(x);
            }, null, function () {
                results.push('done');
            });
            rxTestScheduler.flush();
            expect(results).toEqual(['42!!!', 'done']);
        });
    });
    it('should pass multiple inner arguments as an array', function () {
        function callback(datum, cb) {
            cb(null, datum, 1, 2, 3);
        }
        var boundCallback = Observable.bindNodeCallback(callback, null, rxTestScheduler);
        var results = [];
        boundCallback(42)
            .subscribe(function (x) {
            results.push(x);
        }, null, function () {
            results.push('done');
        });
        rxTestScheduler.flush();
        expect(results).toEqual([[42, 1, 2, 3], 'done']);
    });
    it('should pass multiple inner arguments to the selector if there is one', function () {
        function callback(datum, cb) {
            cb(null, datum, 1, 2, 3);
        }
        function selector(a, b, c, d) {
            expect([a, b, c, d]).toEqual([42, 1, 2, 3]);
            return a + b + c + d;
        }
        var boundCallback = Observable.bindNodeCallback(callback, selector, rxTestScheduler);
        var results = [];
        boundCallback(42)
            .subscribe(function (x) {
            results.push(x);
        }, null, function () {
            results.push('done');
        });
        rxTestScheduler.flush();
        expect(results).toEqual([48, 'done']);
    });
    it('should cache value for next subscription and not call callbackFunc again', function () {
        var calls = 0;
        function callback(datum, cb) {
            calls++;
            cb(null, datum);
        }
        var boundCallback = Observable.bindNodeCallback(callback, null, rxTestScheduler);
        var results1 = [];
        var results2 = [];
        var source = boundCallback(42);
        source.subscribe(function (x) {
            results1.push(x);
        }, null, function () {
            results1.push('done');
        });
        source.subscribe(function (x) {
            results2.push(x);
        }, null, function () {
            results2.push('done');
        });
        rxTestScheduler.flush();
        expect(calls).toBe(1);
        expect(results1).toEqual([42, 'done']);
        expect(results2).toEqual([42, 'done']);
    });
});
//# sourceMappingURL=bindNodeCallback-spec.js.map