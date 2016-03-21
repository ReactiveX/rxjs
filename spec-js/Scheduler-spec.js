"use strict";
var Rx = require('../dist/cjs/Rx');
var Scheduler = Rx.Scheduler;
/** @test {Scheduler} */
describe('Scheduler.queue', function () {
    it('should schedule things recursively', function () {
        var call1 = false;
        var call2 = false;
        Scheduler.queue.active = false;
        Scheduler.queue.schedule(function () {
            call1 = true;
            Scheduler.queue.schedule(function () {
                call2 = true;
            });
        });
        expect(call1).toBe(true);
        expect(call2).toBe(true);
    });
    it('should schedule things in the future too', function (done) {
        var called = false;
        Scheduler.queue.schedule(function () {
            called = true;
        }, 50);
        setTimeout(function () {
            expect(called).toBe(false);
        }, 40);
        setTimeout(function () {
            expect(called).toBe(true);
            done();
        }, 70);
    });
    it('should be reusable after an error is thrown during execution', function (done) {
        var results = [];
        expect(function () {
            Scheduler.queue.schedule(function () {
                results.push(1);
            });
            Scheduler.queue.schedule(function () {
                throw new Error('bad');
            });
        }).toThrow(new Error('bad'));
        setTimeout(function () {
            Scheduler.queue.schedule(function () {
                results.push(2);
                done();
            });
        }, 0);
    });
});
//# sourceMappingURL=Scheduler-spec.js.map