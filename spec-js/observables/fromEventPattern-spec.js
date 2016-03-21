"use strict";
/* globals describe, it, expect, jasmine */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {fromEventPattern} */
describe('Observable.fromEventPattern', function () {
    it('should call addHandler on subscription', function () {
        var addHandlerCalledWith;
        var addHandler = function (h) {
            addHandlerCalledWith = h;
        };
        var removeHandler = function () {
            //noop
        };
        Observable.fromEventPattern(addHandler, removeHandler)
            .subscribe(function () {
            //noop
        });
        expect(typeof addHandlerCalledWith).toBe('function');
    });
    it('should call removeHandler on unsubscription', function () {
        var removeHandlerCalledWith;
        var addHandler = function () {
            //noop
        };
        var removeHandler = function (h) {
            removeHandlerCalledWith = h;
        };
        var subscription = Observable.fromEventPattern(addHandler, removeHandler)
            .subscribe(function () {
            //noop
        });
        subscription.unsubscribe();
        expect(typeof removeHandlerCalledWith).toBe('function');
    });
    it('should send errors in addHandler down the error path', function () {
        Observable.fromEventPattern(function (h) {
            throw 'bad';
        }, function () {
            //noop
        }).subscribe(function () {
            //noop
        }, function (err) {
            expect(err).toBe('bad');
        });
    });
    it('should accept a selector that maps outgoing values', function (done) {
        var target;
        var trigger = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            if (target) {
                target.apply(null, arguments);
            }
        };
        var addHandler = function (handler) {
            target = handler;
        };
        var removeHandler = function (handler) {
            target = null;
        };
        var selector = function (a, b) {
            return a + b + '!';
        };
        Observable.fromEventPattern(addHandler, removeHandler, selector).take(1)
            .subscribe(function (x) {
            expect(x).toBe('testme!');
        }, function (err) {
            done.fail('should not be called');
        }, done);
        trigger('test', 'me');
    });
    it('should send errors in the selector down the error path', function (done) {
        var target;
        var trigger = function (value) {
            if (target) {
                target(value);
            }
        };
        var addHandler = function (handler) {
            target = handler;
        };
        var removeHandler = function (handler) {
            target = null;
        };
        var selector = function (x) {
            throw 'bad';
        };
        Observable.fromEventPattern(addHandler, removeHandler, selector)
            .subscribe(function (x) {
            done.fail('should not be called');
        }, function (err) {
            expect(err).toBe('bad');
            done();
        }, function () {
            done.fail('should not be called');
        });
        trigger('test');
    });
});
//# sourceMappingURL=fromEventPattern-spec.js.map