/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe("zip", function () {
  it("should combine two observables", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    Observable.of(a, b).zipAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
  it("should combine a source with a second", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    a.zip(b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
  it("should combine two immediately-scheduled observables", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).zipAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
  it("should combine an immediately-scheduled source with an immediately-scheduled second", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    a.zip(b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
});