/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.timeout()', function () {
  var defaultTimeoutError = new Error('timeout');
  
  it('should timeout after a specified timeout period', function () {
    var e1 = Observable.never();
    var expected = '-----#';
    
    expectObservable(e1.timeout(50, null, rxTestScheduler)).toBe(expected, null, defaultTimeoutError);
  });
  
  it('should timeout after specified timeout period and send the passed error', function () {
    var e1 = Observable.never();
    var expected = '-----#';
    var value = 'hello';
    
    expectObservable(e1.timeout(50, value, rxTestScheduler)).toBe(expected, null, value);
  });
  
  it('should not timeout if source completes within absolute timeout period', function() {
    var e1 =   hot('--a--b--c--d--e--|');
    var expected = '--a--b--c--d--e--|';
    
    var timeoutValue = new Date(Date.now() + (expected.length + 2) * 10);
    
    expectObservable(e1.timeout(timeoutValue, null, rxTestScheduler)).toBe(expected);
  });
  
  it('should not timeout if source emits within timeout period', function() {
    var e1 =   hot('--a--b--c--d--e--|');
    var expected = '--a--b--c--d--e--|';
    
    expectObservable(e1.timeout(50, null, rxTestScheduler)).toBe(expected);
  });
  
  it('should timeout after a specified timeout period between emit with default error while source emits', function () {
    var e1 =   hot('---a---b---c------d---e---|');
    var expected = '---a---b---c----#';
    
    expectObservable(e1.timeout(50, null, rxTestScheduler)).toBe(expected, {a: 'a', b: 'b', c: 'c'}, defaultTimeoutError);
  });
  
  it('should timeout after a specified delay with passed error while source emits', function () {
    var value = 'hello';
    var e1 =   hot('---a---b---c------d---e---|');
    var expected = '---a---b---c----#';
    
    expectObservable(e1.timeout(50, value, rxTestScheduler)).toBe(expected, {a: 'a', b: 'b', c: 'c'}, value);
  });
});