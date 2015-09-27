/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.sampleTime', function () {
  it('should get samples on a delay', function() {
    var e1 =   hot('----a----b----c----d----e----f----|');
    var expected = '-----------b----------d----------f|';
    
    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
  });

  it('should raise error if source raises error', function() {
    var e1 =   hot('----a----b----c----d----#');
    var expected = '-----------b----------d-#';
    
    expectObservable(e1.sampleTime(110, rxTestScheduler)).toBe(expected);
  });
  
  it('should completes if source does not emits', function() {
    var e1 = Observable.empty();
    var expected = '|';
    
    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
  });
  
  it('should raise error if source throws immediately', function() {
    var e1 = Observable.throw('error');
    var expected = '#';
    
    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
  });
  
  it('should not completes if source does not complete', function() {
    var e1 =   Observable.never();
    var expected = '-';
   
    expectObservable(e1.sampleTime(60, rxTestScheduler)).toBe(expected);
  });
});