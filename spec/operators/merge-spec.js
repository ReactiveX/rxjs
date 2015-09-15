/* globals describe, it, expect, hot, cold, expectObservable, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe("Observable.prototype.merge", function () {
  it("should merge a source with a second", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    a.merge(b).subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });
  
  it("should merge an immediately-scheduled source with an immediately-scheduled second", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [1, 2, 4, 3, 5, 6, 7, 8];
    var i = 0;
    a.merge(b, immediateScheduler).subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });
  
  
  it('should handle merging two hot observables', function (){
    var e1 =    hot('--a-----b-----c----|');
    var e2 =    hot('-----d-----e-----f---|');
    var expected =  '--a--d--b--e--c--f---|';
    expectObservable(e1.merge(e2, rxTestScheduler)).toBe(expected);
  });
});

describe('Observable.prototype.mergeAll', function () {
  it("should merge two observables", function (done) {
    var a = Observable.of(1, 2, 3);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [1, 2, 3, 4, 5, 6, 7, 8];
    var i = 0;
    Observable.of(a, b).mergeAll().subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });
  
  it("should merge two immediately-scheduled observables", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [1, 2, 4, 3, 5, 6, 7, 8];
    var i = 0;
    Observable.of(a, b, immediateScheduler).mergeAll().subscribe(function (val) {
      expect(val).toBe(r[i++]);
    }, null, done);
  });
});