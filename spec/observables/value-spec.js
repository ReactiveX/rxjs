/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Scheduler = Rx.Scheduler;

describe('Observable.value', function () {
  it('should emit one value', function (done) {
    var calls = 0;
    Observable.value(42).subscribe(function (x) {
      expect(++calls).toBe(1);
      expect(x).toBe(42);
      done();
    });
  });
});