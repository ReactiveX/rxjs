/* globals describe, it, expect, hot, expectObservable, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowTime', function () {
  it('should emit windows at intervals', function () {
    var e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    //  100 frames        0---------1---------2------|
    var expected =       'x---------y---------z------|';
    var x =              '---a--b--c|';
    var y =              '------------d--e--f-|';
    var z =              '---------------------g--h--|';

    var values = {
      x: Rx.TestScheduler.parseMarbles(x),
      y: Rx.TestScheduler.parseMarbles(y),
      z: Rx.TestScheduler.parseMarbles(z)
    };

    var source = e1.windowTime(100, null, rxTestScheduler)
      .map(function (obs) {
        var arr = [];

        obs.materialize().map(function (notification) {
          return { frame: rxTestScheduler.frame, notification: notification };
        }).subscribe(function (value) { arr.push(value); });

        return arr;
      });

    expectObservable(source).toBe(expected, values);
  });

  it('should emit windows that have been created at intervals and close after the specified delay', function () {
    var e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    //  100 frames        0---------1---------2------|
    //  50                 ----|
  //  50                           ----|
    //  50                                     ----|
    var expected =       'x---------y---------z------|';
    var x =              '---a-|';
    var y =              '------------d--(e|)';
    var z =              '---------------------g--h|';

    var values = {
      x: Rx.TestScheduler.parseMarbles(x),
      y: Rx.TestScheduler.parseMarbles(y),
      z: Rx.TestScheduler.parseMarbles(z)
    };

    var source = e1.windowTime(50, 100, rxTestScheduler)
      .map(function (obs) {
        var arr = [];

        obs.materialize().map(function (notification) {
          return { frame: rxTestScheduler.frame, notification: notification };
        }).subscribe(function (value) { arr.push(value); });

        return arr;
      });

    expectObservable(source).toBe(expected, values);
  });
});