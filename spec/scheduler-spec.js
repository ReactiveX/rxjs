/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Scheduler = Rx.Scheduler;

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
});