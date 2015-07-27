/* globals describe, it, expect, spyOn */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediate = Rx.Scheduler.immediate;
var Observer = Rx.Observer;

describe('Observable.timer', function () {
  it('schedule a value of 0 then complete', function (done) {
    var start = Date.now();
    Observable.timer(100)
      .subscribe(function (x) {
          expect(x).toBe(0);
        }, null,
        function () {
          var now = Date.now();
          expect(now - start >= 100).toBe(true, 'timer fired in ' + (now - start) + 'ms');
          done();
        });
  });
});