/* globals describe, it, expect, spyOn */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediate = Rx.Scheduler.immediate;
var Observer = Rx.Observer;

describe('Observable.interval', function () {
  it('should set up an interval', function () {
    var expected = '----------0---------1---------2---------3---------4---------5---------6-----';
    expectObservable(Observable.interval(100, rxTestScheduler)).toBe(expected, [0,1,2,3,4,5,6]);
  });
});