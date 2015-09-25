/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe("zip", function () {
  it('should work with two nevers', function () {
    var a = Observable.never();
    var b = Observable.never();
    var expected = '-';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with never and empty', function () {
    var a = Observable.never();
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with empty and never', function () {
    var a = Observable.empty();
    var b = Observable.never();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with empty and empty', function () {
    var a = Observable.empty();
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it("should combine two observables", function () {
    var a =    hot('---1---2---3---');
    var b =    hot('--4--5--6--7--8--');
    var expected = '---x---y---z';
    expectObservable(Observable.of(a, b).zipAll())
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
  });
  it("should combine a source with a second", function () {
    var a =    hot('---1---2---3---');
    var b =    hot('--4--5--6--7--8--');
    var expected = '---x---y---z';
    expectObservable(a.zip(b))
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
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
  it("should combine a source with an immediately-scheduled source", function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).zipAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
  it('should work with error', function (){
    var a =    hot('----------|');
    var b =    hot('------#', null, 'too bad');
    var expected = '------#';
    expectObservable(a.zip(b)).toBe(expected, null, 'too bad');
  });
  it('should work with throw', function () {
    var a = Observable.throw(new Error('too bad'));
    var b = hot('--1--2--3--');
    var expected = '#';
    expectObservable(a.zip(b)).toBe(expected, null, new Error('too bad'));
  });
});
