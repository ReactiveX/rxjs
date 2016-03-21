"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var asap = Rx.Scheduler.asap;
/** @test {AsapScheduler} */
describe('AsapScheduler', function () {
    it('should exist', function () {
        expect(asap).toBeDefined();
    });
    it('should schedule an action to happen later', function (done) {
        var actionHappened = false;
        asap.schedule(function () {
            actionHappened = true;
            done();
        });
        if (actionHappened) {
            done.fail('Scheduled action happened synchronously');
        }
    });
    it('should execute the rest of the scheduled actions if the first action is canceled', function (done) {
        var actionHappened = false;
        var firstSubscription = null;
        var secondSubscription = null;
        firstSubscription = asap.schedule(function () {
            actionHappened = true;
            if (secondSubscription) {
                secondSubscription.unsubscribe();
            }
            done.fail('The first action should not have executed.');
        });
        secondSubscription = asap.schedule(function () {
            if (!actionHappened) {
                done();
            }
        });
        if (actionHappened) {
            done.fail('Scheduled action happened synchronously');
        }
        else {
            firstSubscription.unsubscribe();
        }
    });
});
//# sourceMappingURL=AsapScheduler-spec.js.map