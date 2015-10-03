/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.combineAll()', function () {
  it('should combine two observables', function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var expected = [[3, 4], [3, 5], [3, 6], [3, 7], [3, 8]];
    Observable.of(a, b).combineAll().subscribe(function (vals) {
      expect(vals).toEqual(expected.shift());
    }, null, function () {
      expect(expected.length).toBe(0);
      done();
    });
  });

  it('should combine two immediately-scheduled observables', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).combineAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function () {
      expect(i).toEqual(r.length);
      done();
    });
  });
});