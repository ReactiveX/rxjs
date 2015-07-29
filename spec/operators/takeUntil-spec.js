/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.takeUntil()', function () {
  it('should take values until another Observable emits', function (done) {
    var expected = [0, 1, 2, 3, 4];
    var i = 0;
    var nextSpy = jasmine.createSpy('nextSpy');

    Observable.timer(0, 16)
      .takeUntil(Observable.timer(81))
      .subscribe(nextSpy, null, function () {
        expect(nextSpy.calls.count()).toBe(5);
        expected.forEach(function (v) {
          expect(nextSpy.calls.argsFor(v)[0]).toBe(v);
        });
        done();
      });
  });
});