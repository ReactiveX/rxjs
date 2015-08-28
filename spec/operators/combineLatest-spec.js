/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('combineLatest', function () {

  it("should combine two observables", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[3, 4], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    Observable.of(a, b).combineAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function() {
      expect(i).toEqual(r.length);
      done();
    });
  });
  it("should combine a source with a second", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[3, 4], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    a.combineLatest(b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function() {
      expect(i).toEqual(r.length);
      done();
    });
  });
  it("should combine two immediately-scheduled observables", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).combineAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function() {
      expect(i).toEqual(r.length);
      done();
    });
  });
  it("should combine an immediately-scheduled source with an immediately-scheduled second", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];
    var i = 0;
    a.combineLatest(b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, function() {
      expect(i).toEqual(r.length);
      done();
    });
  });
  it('should combineLatest the source with the provided observables', function (done) {
    var expected = ['00', '01', '11', '12', '22', '23'];
    var i = 0;
    Observable.interval(50).take(3)
      .combineLatest(Observable.interval(45).take(4), function (a, b) {
        return '' + a + b;
      })
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, function() {
        expect(i).toEqual(expected.length);
        done();
      });
  }, 300);
});
