"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Rx = require('../dist/cjs/Rx');
var Subscriber = Rx.Subscriber;
var Observable = Rx.Observable;
function expectFullObserver(val) {
    expect(typeof val).toBe('object');
    expect(typeof val.next).toBe('function');
    expect(typeof val.error).toBe('function');
    expect(typeof val.complete).toBe('function');
    expect(typeof val.isUnsubscribed).toBe('boolean');
}
/** @test {Observable} */
describe('Observable', function () {
    it('should be constructed with a subscriber function', function (done) {
        var source = new Observable(function (observer) {
            expectFullObserver(observer);
            observer.next(1);
            observer.complete();
        });
        source.subscribe(function (x) { expect(x).toBe(1); }, null, done);
    });
    describe('forEach', function () {
        it('should iterate and return a Promise', function (done) {
            var expected = [1, 2, 3];
            var result = Observable.of(1, 2, 3).forEach(function (x) {
                expect(x).toBe(expected.shift());
            }, Promise)
                .then(done);
            expect(typeof result.then).toBe('function');
        });
        it('should reject promise when in error', function (done) {
            Observable.throw('bad').forEach(function (x) {
                done.fail('should not be called');
            }, Promise).then(function () {
                done.fail('should not complete');
            }, function (err) {
                expect(err).toBe('bad');
                done();
            });
        });
        it('should allow Promise to be globally configured', function (done) {
            var wasCalled = false;
            __root__.Rx = {};
            __root__.Rx.config = {};
            __root__.Rx.config.Promise = function MyPromise(callback) {
                wasCalled = true;
                return new Promise(callback);
            };
            Observable.of(42).forEach(function (x) {
                expect(x).toBe(42);
            }, null).then(function () {
                expect(wasCalled).toBe(true);
                done();
            });
        });
        it('should reject promise if nextHandler throws', function (done) {
            var results = [];
            Observable.of(1, 2, 3).forEach(function (x) {
                if (x === 3) {
                    throw new Error('NO THREES!');
                }
                results.push(x);
            }, null)
                .then(done.fail, function (err) {
                expect(err).toEqual(new Error('NO THREES!'));
                expect(results).toEqual([1, 2]);
            })
                .then(done);
        });
        it('should handle a synchronous throw from the next handler and tear down', function (done) {
            var unsubscribeCalled = false;
            var syncObservable = new Observable(function (observer) {
                observer.next(1);
                observer.next(2);
                observer.next(3);
                return function () {
                    unsubscribeCalled = true;
                };
            });
            var results = [];
            syncObservable.forEach(function (x) {
                results.push(x);
                if (x === 2) {
                    throw new Error('I told, you Bobby Boucher, twos are the debil!');
                }
            }).then(function () { return done.fail(); }, function (err) {
                results.push(err);
                expect(results).toEqual([1, 2, new Error('I told, you Bobby Boucher, twos are the debil!')]);
                expect(unsubscribeCalled).toBe(true);
                done();
            });
        });
        it('should handle an asynchronous throw from the next handler and tear down', function (done) {
            var unsubscribeCalled = false;
            var syncObservable = new Observable(function (observer) {
                var i = 1;
                var id = setInterval(function () { return observer.next(i++); }, 1);
                return function () {
                    clearInterval(id);
                    unsubscribeCalled = true;
                };
            });
            var results = [];
            syncObservable.forEach(function (x) {
                results.push(x);
                if (x === 2) {
                    throw new Error('I told, you Bobby Boucher, twos are the debil!');
                }
            }).then(function () { return done.fail(); }, function (err) {
                results.push(err);
                expect(results).toEqual([1, 2, new Error('I told, you Bobby Boucher, twos are the debil!')]);
                expect(unsubscribeCalled).toBe(true);
                done();
            });
        });
    });
    describe('subscribe', function () {
        it('should be synchronous', function () {
            var subscribed = false;
            var nexted;
            var completed;
            var source = new Observable(function (observer) {
                subscribed = true;
                observer.next('wee');
                expect(nexted).toBe('wee');
                observer.complete();
                expect(completed).toBe(true);
            });
            expect(subscribed).toBe(false);
            var mutatedByNext = false;
            var mutatedByComplete = false;
            source.subscribe(function (x) {
                nexted = x;
                mutatedByNext = true;
            }, null, function () {
                completed = true;
                mutatedByComplete = true;
            });
            expect(mutatedByNext).toBe(true);
            expect(mutatedByComplete).toBe(true);
        });
        it('should work when subscribe is called with no arguments', function () {
            var source = new Observable(function (subscriber) {
                subscriber.next('foo');
                subscriber.complete();
            });
            source.subscribe();
        });
        it('should return a Subscription that calls the unsubscribe function returned by the subscriber', function () {
            var unsubscribeCalled = false;
            var source = new Observable(function () {
                return function () {
                    unsubscribeCalled = true;
                };
            });
            var sub = source.subscribe(function () {
                //noop
            });
            expect(sub instanceof Rx.Subscription).toBe(true);
            expect(unsubscribeCalled).toBe(false);
            expect(typeof sub.unsubscribe).toBe('function');
            sub.unsubscribe();
            expect(unsubscribeCalled).toBe(true);
        });
        it('should run unsubscription logic when an error is thrown sending messages synchronously', function () {
            var messageError = false;
            var messageErrorValue = false;
            var unsubscribeCalled = false;
            var sub;
            var source = new Observable(function (observer) {
                observer.next('boo!');
                return function () {
                    unsubscribeCalled = true;
                };
            });
            try {
                sub = source.subscribe(function (x) { throw x; });
            }
            catch (e) {
                messageError = true;
                messageErrorValue = e;
            }
            expect(sub).toBe(undefined);
            expect(unsubscribeCalled).toBe(true);
            expect(messageError).toBe(true);
            expect(messageErrorValue).toBe('boo!');
        });
        it('should dispose of the subscriber when an error is thrown sending messages synchronously', function () {
            var messageError = false;
            var messageErrorValue = false;
            var unsubscribeCalled = false;
            var sub;
            var subscriber = new Subscriber(function (x) { throw x; });
            var source = new Observable(function (observer) {
                observer.next('boo!');
                return function () {
                    unsubscribeCalled = true;
                };
            });
            try {
                sub = source.subscribe(subscriber);
            }
            catch (e) {
                messageError = true;
                messageErrorValue = e;
            }
            expect(sub).toBe(undefined);
            expect(subscriber.isUnsubscribed).toBe(true);
            expect(unsubscribeCalled).toBe(true);
            expect(messageError).toBe(true);
            expect(messageErrorValue).toBe('boo!');
        });
        describe('when called with an anonymous observer', function () {
            it('should accept an anonymous observer with just a next function and call the next function in the context' +
                ' of the anonymous observer', function (done) {
                //intentionally not using lambda to avoid typescript's this context capture
                var o = {
                    next: function next(x) {
                        expect(this).toBe(o);
                        expect(x).toBe(1);
                        done();
                    }
                };
                Observable.of(1).subscribe(o);
            });
            it('should accept an anonymous observer with just an error function and call the error function in the context' +
                ' of the anonymous observer', function (done) {
                //intentionally not using lambda to avoid typescript's this context capture
                var o = {
                    error: function error(err) {
                        expect(this).toBe(o);
                        expect(err).toBe('bad');
                        done();
                    }
                };
                Observable.throw('bad').subscribe(o);
            });
            it('should accept an anonymous observer with just a complete function and call the complete function in the' +
                ' context of the anonymous observer', function (done) {
                //intentionally not using lambda to avoid typescript's this context capture
                var o = {
                    complete: function complete() {
                        expect(this).toBe(o);
                        done();
                    }
                };
                Observable.empty().subscribe(o);
            });
            it('should accept an anonymous observer with no functions at all', function () {
                expect(function () {
                    Observable.empty().subscribe({});
                }).not.toThrow();
            });
            it('should not run unsubscription logic when an error is thrown sending messages synchronously to an' +
                ' anonymous observer', function () {
                var messageError = false;
                var messageErrorValue = false;
                var unsubscribeCalled = false;
                //intentionally not using lambda to avoid typescript's this context capture
                var o = {
                    next: function next(x) {
                        expect(this).toBe(o);
                        throw x;
                    }
                };
                var sub;
                var source = new Observable(function (observer) {
                    observer.next('boo!');
                    return function () {
                        unsubscribeCalled = true;
                    };
                });
                try {
                    sub = source.subscribe(o);
                }
                catch (e) {
                    messageError = true;
                    messageErrorValue = e;
                }
                expect(sub).toBe(undefined);
                expect(unsubscribeCalled).toBe(true);
                expect(messageError).toBe(true);
                expect(messageErrorValue).toBe('boo!');
            });
        });
    });
});
/** @test {Observable} */
describe('Observable.create', function () {
    it('should create an Observable', function () {
        var result = Observable.create(function () {
            //noop
        });
        expect(result instanceof Observable).toBe(true);
    });
    it('should provide an observer to the function', function () {
        var called = false;
        var result = Observable.create(function (observer) {
            called = true;
            expectFullObserver(observer);
            observer.complete();
        });
        expect(called).toBe(false);
        result.subscribe(function () {
            //noop
        });
        expect(called).toBe(true);
    });
});
/** @test {Observable} */
describe('Observable.lift', function () {
    it('should be overrideable in a custom Observable type that composes', function (done) {
        var MyCustomObservable = (function (_super) {
            __extends(MyCustomObservable, _super);
            function MyCustomObservable() {
                _super.apply(this, arguments);
            }
            MyCustomObservable.prototype.lift = function (operator) {
                var observable = new MyCustomObservable();
                observable.source = this;
                observable.operator = operator;
                return observable;
            };
            return MyCustomObservable;
        }(Rx.Observable));
        var result = new MyCustomObservable(function (observer) {
            observer.next(1);
            observer.next(2);
            observer.next(3);
            observer.complete();
        }).map(function (x) { return 10 * x; });
        expect(result instanceof MyCustomObservable).toBe(true);
        var expected = [10, 20, 30];
        result.subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, done.fail, done);
    });
    it('should allow injecting behaviors into all subscribers in an operator ' +
        'chain when overridden', function (done) {
        // The custom Subscriber
        var log = [];
        var LogSubscriber = (function (_super) {
            __extends(LogSubscriber, _super);
            function LogSubscriber() {
                _super.apply(this, arguments);
            }
            LogSubscriber.prototype.next = function (value) {
                log.push('next ' + value);
                if (!this.isStopped) {
                    this._next(value);
                }
            };
            return LogSubscriber;
        }(Rx.Subscriber));
        // The custom Operator
        var LogOperator = (function (_super) {
            __extends(LogOperator, _super);
            function LogOperator(childOperator) {
                _super.call(this);
                this.childOperator = childOperator;
            }
            LogOperator.prototype.call = function (subscriber) {
                return this.childOperator.call(new LogSubscriber(subscriber));
            };
            return LogOperator;
        }(Rx.Operator));
        // The custom Observable
        var LogObservable = (function (_super) {
            __extends(LogObservable, _super);
            function LogObservable() {
                _super.apply(this, arguments);
            }
            LogObservable.prototype.lift = function (operator) {
                var observable = new LogObservable();
                observable.source = this;
                observable.operator = new LogOperator(operator);
                return observable;
            };
            return LogObservable;
        }(Observable));
        // Use the LogObservable
        var result = new LogObservable(function (observer) {
            observer.next(1);
            observer.next(2);
            observer.next(3);
            observer.complete();
        })
            .map(function (x) { return 10 * x; })
            .filter(function (x) { return x > 15; })
            .count();
        expect(result instanceof LogObservable).toBe(true);
        var expected = [2];
        result.subscribe(function (x) {
            expect(x).toBe(expected.shift());
        }, done.fail, function () {
            expect(log).toEqual([
                'next 10',
                'next 20',
                'next 20',
                'next 30',
                'next 30',
                'next 2' // count
            ]);
            done();
        });
    });
});
//# sourceMappingURL=Observable-spec.js.map