"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var ArrayObservable_1 = require('../../dist/cjs/observable/ArrayObservable');
var ScalarObservable_1 = require('../../dist/cjs/observable/ScalarObservable');
var EmptyObservable_1 = require('../../dist/cjs/observable/EmptyObservable');
var Observable = Rx.Observable;
/** @test {of} */
describe('Observable.of', function () {
    it('should create an observable from the provided values', function (done) {
        var x = { foo: 'bar' };
        var expected = [1, 'a', x];
        var i = 0;
        Observable.of(1, 'a', x)
            .subscribe(function (y) {
            expect(y).toBe(expected[i++]);
        }, done.fail, done);
    });
    it('should return a scalar observable if only passed one value', function () {
        var obs = Observable.of('one');
        expect(obs instanceof ScalarObservable_1.ScalarObservable).toBe(true);
    });
    it('should return a scalar observable if only passed one value and a scheduler', function () {
        var obs = Observable.of('one', Rx.Scheduler.queue);
        expect(obs instanceof ScalarObservable_1.ScalarObservable).toBe(true);
    });
    it('should return an array observable if passed many values', function () {
        var obs = Observable.of('one', 'two', 'three');
        expect(obs instanceof ArrayObservable_1.ArrayObservable).toBe(true);
    });
    it('should return an empty observable if passed no values', function () {
        var obs = Observable.of();
        expect(obs instanceof EmptyObservable_1.EmptyObservable).toBe(true);
    });
    it('should return an empty observable if passed only a scheduler', function () {
        var obs = Observable.of(Rx.Scheduler.queue);
        expect(obs instanceof EmptyObservable_1.EmptyObservable).toBe(true);
    });
    it('should emit one value', function (done) {
        var calls = 0;
        Observable.of(42).subscribe(function (x) {
            expect(++calls).toBe(1);
            expect(x).toBe(42);
        }, function (err) {
            done.fail('should not be called');
        }, done);
    });
    it('should handle an Observable as the only value', function () {
        var source = Observable.of(Observable.of('a', 'b', 'c', rxTestScheduler), rxTestScheduler);
        expect(source instanceof ScalarObservable_1.ScalarObservable).toBe(true);
        var result = source.concatAll();
        expectObservable(result).toBe('(abc|)');
    });
    it('should handle many Observable as the given values', function () {
        var source = Observable.of(Observable.of('a', 'b', 'c', rxTestScheduler), Observable.of('d', 'e', 'f', rxTestScheduler), rxTestScheduler);
        expect(source instanceof ArrayObservable_1.ArrayObservable).toBe(true);
        var result = source.concatAll();
        expectObservable(result).toBe('(abcdef|)');
    });
});
//# sourceMappingURL=of-spec.js.map