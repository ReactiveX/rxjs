/* globals describe, it, expect, spyOn */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediate = Rx.Scheduler.immediate;
var Observer = Rx.Observer;

describe('Observable.interval', function () {
  it('should next 5 times then complete', function (done) {
    var start = Date.now();
    var expected = [0, 1, 2, 3, 4];
    var i = 0;
    var nextSpy = jasmine.createSpy('nextSpy');

    Observable.interval(10).take(5)
      .subscribe(nextSpy, null,
        function () {
          var now = Date.now();
          expect(now - start >= 50).toBe(true, 'interval ended in ' + (now - start) + 'ms');
          expect(nextSpy.calls.count()).toBe(5);
          expected.forEach(function (v) {
            expect(nextSpy.calls.argsFor(v)[0]).toBe(v);
          });
          done();
        });
  });
});