"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var ScalarObservable_1 = require('../../dist/cjs/observable/ScalarObservable');
describe('ScalarObservable', function () {
    it('should create expose a value property', function () {
        var s = new ScalarObservable_1.ScalarObservable(1);
        expect(s.value).toBe(1);
    });
    it('should create ScalarObservable via static create function', function () {
        var s = new ScalarObservable_1.ScalarObservable(1);
        var r = ScalarObservable_1.ScalarObservable.create(1);
        expect(s).toEqual(r);
    });
    it('should not schedule further if subscriber unsubscribed', function () {
        var s = new ScalarObservable_1.ScalarObservable(1, rxTestScheduler);
        var subscriber = new Rx.Subscriber();
        s.subscribe(subscriber);
        subscriber.isUnsubscribed = true;
        rxTestScheduler.flush();
    });
});
//# sourceMappingURL=ScalarObservable-spec.js.map