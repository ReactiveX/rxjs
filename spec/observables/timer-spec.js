/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediate = Rx.Scheduler.immediate;
var Observer = Rx.Observer;

describe('Observable.timer', function () {
  it('should schedule a value of 0 then complete', function () {
    
    var source = Observable.timer(50, undefined, rxTestScheduler);
    var expected = '-----(x|)';
    
    expectObservable(source).toBe(expected, {x: 0});
  });
});