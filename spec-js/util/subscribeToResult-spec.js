"use strict";
var chai_1 = require('chai');
var Rx = require('../../dist/cjs/Rx');
var subscribeToResult_1 = require('../../dist/cjs/util/subscribeToResult');
var OuterSubscriber_1 = require('../../dist/cjs/OuterSubscriber');
var iterator_1 = require('../../dist/cjs/symbol/iterator');
var symbol_observable_1 = require('symbol-observable');
describe('subscribeToResult', function () {
    it('should synchronously complete when subscribe to scalarObservable', function () {
        var result = Rx.Observable.of(42);
        var expected;
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) { return expected = x; });
        var subscription = subscribeToResult_1.subscribeToResult(subscriber, result);
        chai_1.expect(expected).to.be.equal(42);
        chai_1.expect(subscription).to.be.null;
    });
    it('should subscribe to observables that are an instanceof Rx.Observable', function (done) {
        var expected = [1, 2, 3];
        var result = Rx.Observable.range(1, 3);
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            chai_1.expect(expected.shift()).to.be.equal(x);
        }, function () {
            done(new Error('should not be called'));
        }, function () {
            chai_1.expect(expected).to.be.empty;
            done();
        });
        subscribeToResult_1.subscribeToResult(subscriber, result);
    });
    it('should emit error when observable emits error', function (done) {
        var result = Rx.Observable.throw(new Error('error'));
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            done(new Error('should not be called'));
        }, function (err) {
            chai_1.expect(err).to.be.an('error', 'error');
            done();
        }, function () {
            done(new Error('should not be called'));
        });
        subscribeToResult_1.subscribeToResult(subscriber, result);
    });
    it('should subscribe to an array and emit synchronously', function () {
        var result = [1, 2, 3];
        var expected = [];
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) { return expected.push(x); });
        subscribeToResult_1.subscribeToResult(subscriber, result);
        chai_1.expect(expected).to.be.deep.equal(result);
    });
    it('should subscribe to a promise', function (done) {
        var result = Promise.resolve(42);
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            chai_1.expect(x).to.be.equal(42);
        }, function () {
            done(new Error('should not be called'));
        }, done);
        subscribeToResult_1.subscribeToResult(subscriber, result);
    });
    it('should emits error when the promise rejects', function (done) {
        var result = Promise.reject(42);
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            done(new Error('should not be called'));
        }, function (x) {
            chai_1.expect(x).to.be.equal(42);
            done();
        }, function () {
            done(new Error('should not be called'));
        });
        subscribeToResult_1.subscribeToResult(subscriber, result);
    });
    it('should subscribe an iterable and emit results synchronously', function () {
        var expected;
        var iteratorResults = [
            { value: 42, done: false },
            { done: true }
        ];
        var iterable = (_a = {},
            _a[iterator_1.$$iterator] = function () {
                return {
                    next: function () {
                        return iteratorResults.shift();
                    }
                };
            },
            _a
        );
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) { return expected = x; });
        subscribeToResult_1.subscribeToResult(subscriber, iterable);
        chai_1.expect(expected).to.be.equal(42);
        var _a;
    });
    it('should subscribe to to an object that implements Symbol.observable', function (done) {
        var observableSymbolObject = (_a = {}, _a[symbol_observable_1.default] = function () { return Rx.Observable.of(42); }, _a);
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            chai_1.expect(x).to.be.equal(42);
        }, function () {
            done(new Error('should not be called'));
        }, done);
        subscribeToResult_1.subscribeToResult(subscriber, observableSymbolObject);
        var _a;
    });
    it('should emit an error if value returned by Symbol.observable call is not a valid observable', function (done) {
        var observableSymbolObject = (_a = {}, _a[symbol_observable_1.default] = function () { return ({}); }, _a);
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            done(new Error('should not be called'));
        }, function (x) {
            chai_1.expect(x).to.be.an('error', 'invalid observable');
            done();
        }, function () {
            done(new Error('should not be called'));
        });
        subscribeToResult_1.subscribeToResult(subscriber, observableSymbolObject);
        var _a;
    });
    it('should emit an error when trying to subscribe to an unknown type of object', function (done) {
        var subscriber = new OuterSubscriber_1.OuterSubscriber(function (x) {
            done(new Error('should not be called'));
        }, function (x) {
            chai_1.expect(x).to.be.an('error', 'unknown type returned');
            done();
        }, function () {
            done(new Error('should not be called'));
        });
        subscribeToResult_1.subscribeToResult(subscriber, {});
    });
});
//# sourceMappingURL=subscribeToResult-spec.js.map