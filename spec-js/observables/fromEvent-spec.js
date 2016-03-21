"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {fromEvent} */
describe('Observable.fromEvent', function () {
    it('should setup an event observable on objects with "on" and "off" ', function () {
        var onEventName;
        var onHandler;
        var offEventName;
        var offHandler;
        var obj = {
            on: function (a, b) {
                onEventName = a;
                onHandler = b;
            },
            off: function (a, b) {
                offEventName = a;
                offHandler = b;
            }
        };
        var subscription = Observable.fromEvent(obj, 'click')
            .subscribe(function () {
            //noop
        });
        subscription.unsubscribe();
        expect(onEventName).toBe('click');
        expect(typeof onHandler).toBe('function');
        expect(offEventName).toBe(onEventName);
        expect(offHandler).toBe(onHandler);
    });
    it('should setup an event observable on objects with "addEventListener" and "removeEventListener" ', function () {
        var onEventName;
        var onHandler;
        var offEventName;
        var offHandler;
        var obj = {
            addEventListener: function (a, b, useCapture) {
                onEventName = a;
                onHandler = b;
            },
            removeEventListener: function (a, b, useCapture) {
                offEventName = a;
                offHandler = b;
            }
        };
        var subscription = Observable.fromEvent(obj, 'click')
            .subscribe(function () {
            //noop
        });
        subscription.unsubscribe();
        expect(onEventName).toBe('click');
        expect(typeof onHandler).toBe('function');
        expect(offEventName).toBe(onEventName);
        expect(offHandler).toBe(onHandler);
    });
    it('should setup an event observable on objects with "addListener" and "removeListener" ', function () {
        var onEventName;
        var onHandler;
        var offEventName;
        var offHandler;
        var obj = {
            addListener: function (a, b) {
                onEventName = a;
                onHandler = b;
            },
            removeListener: function (a, b) {
                offEventName = a;
                offHandler = b;
            }
        };
        var subscription = Observable.fromEvent(obj, 'click')
            .subscribe(function () {
            //noop
        });
        subscription.unsubscribe();
        expect(onEventName).toBe('click');
        expect(typeof onHandler).toBe('function');
        expect(offEventName).toBe(onEventName);
        expect(offHandler).toBe(onHandler);
    });
    it('should pass through events that occur', function (done) {
        var send;
        var obj = {
            on: function (name, handler) {
                send = handler;
            },
            off: function () {
                //noop
            }
        };
        Observable.fromEvent(obj, 'click').take(1)
            .subscribe(function (e) {
            expect(e).toBe('test');
        }, function (err) {
            done.fail('should not be called');
        }, done);
        send('test');
    });
    it('should pass through events that occur and use the selector if provided', function (done) {
        var send;
        var obj = {
            on: function (name, handler) {
                send = handler;
            },
            off: function () {
                //noop
            }
        };
        function selector(x) {
            return x + '!';
        }
        Observable.fromEvent(obj, 'click', selector).take(1)
            .subscribe(function (e) {
            expect(e).toBe('test!');
        }, function (err) {
            done.fail('should not be called');
        }, done);
        send('test');
    });
    it('should not fail if no event arguments are passed and the selector does not return', function (done) {
        var send;
        var obj = {
            on: function (name, handler) {
                send = handler;
            },
            off: function () {
                //noop
            }
        };
        function selector() {
            //noop
        }
        Observable.fromEvent(obj, 'click', selector).take(1)
            .subscribe(function (e) {
            expect(e).toBeUndefined();
        }, function (err) {
            done.fail('should not be called');
        }, done);
        send();
    });
    it('should return a value from the selector if no event arguments are passed', function (done) {
        var send;
        var obj = {
            on: function (name, handler) {
                send = handler;
            },
            off: function () {
                //noop
            }
        };
        function selector() {
            return 'no arguments';
        }
        Observable.fromEvent(obj, 'click', selector).take(1)
            .subscribe(function (e) {
            expect(e).toBe('no arguments');
        }, function (err) {
            done.fail('should not be called');
        }, done);
        send();
    });
    it('should pass multiple arguments to selector from event emitter', function (done) {
        var send;
        var obj = {
            on: function (name, handler) {
                send = handler;
            },
            off: function () {
                //noop
            }
        };
        function selector(x, y, z) {
            return [].slice.call(arguments);
        }
        Observable.fromEvent(obj, 'click', selector).take(1)
            .subscribe(function (e) {
            expect(e).toEqual([1, 2, 3]);
        }, function (err) {
            done.fail('should not be called');
        }, done);
        send(1, 2, 3);
    });
});
//# sourceMappingURL=fromEvent-spec.js.map