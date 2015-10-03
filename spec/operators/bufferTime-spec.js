/* globals describe, it, expect, hot, cold, rxTestScheduler, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferTime', function () {
  it('should emit buffers at intervals', function () {
    var values = {
      w: ['a','b'],
      x: ['c','d','e'],
      y: ['f', 'g'],
      z: []
    };
    var e1 =   hot('---a---b---c---d---e---f---g---|');
    var expected = '----------w---------x---------y(z|)';

    expectObservable(e1.bufferTime(100, null, rxTestScheduler)).toBe(expected, values);
  });

  it('should emit buffers at intervals test 2', function () {
    var e1 =   hot('---------a---------b---------c---------d---------e---------g--------|');
    var expected = '--------------------------------x-------------------------------y---(z|)';

    expectObservable(e1.bufferTime(320, null, rxTestScheduler)).toBe(expected, { x: ['a','b','c'], y: ['d', 'e', 'g'], z: []});
  });

  it('should emit buffers that have been created at intervals and close after the specified delay', function () {
    var e1 =   hot('---a---b---c----d----e----f----g----h----i----(k|)');
                 // --------------------*--------------------*----  start interval
                 // ---------------------|                          timespans
                 //                     ---------------------|
                 //                                          -----|
    var expected = '---------------------x-------------------y----(z|)';
    var values = {
      x: ['a', 'b', 'c', 'd', 'e'],
      y: ['e', 'f', 'g', 'h', 'i'],
      z: ['i', 'k']
    };
    expectObservable(e1.bufferTime(210, 200, rxTestScheduler)).toBe(expected, values);
  });

  it('should handle empty', function () {
    var e1 = Observable.empty();
    expectObservable(e1.bufferTime(100, null, rxTestScheduler)).toBe('(a|)', { a: [] });
  });

  it('should handle never', function () {
    var e1 = Observable.never();
    var expected = '----------a---------a---------a---------a---------a---------a---------a-----'; // 750 frame limit
    expectObservable(e1.bufferTime(100, null, rxTestScheduler)).toBe(expected, { a: [] });
  });

  it('should handle throw', function () {
    var e1 = Observable.throw(new Error('haha'));
    var expected = '#';
    expectObservable(e1.bufferTime(100, null, rxTestScheduler)).toBe(expected, undefined, new Error('haha'));
  });

  it('should handle errors', function () {
    var values = {
      w: ['a','b']
    };
    var e1 =   hot('---a---b---c---#---e---f---g---|');
    var expected = '----------w----#';

    expectObservable(e1.bufferTime(100, null, rxTestScheduler)).toBe(expected, values);
  });

  it('should emit buffers that have been created at intervals and close after the specified delay with errors', function () {
    var e1 =   hot('---a---b---c----d----e----f----g----h----i--#');
                 // --------------------*--------------------*----  start interval
                 // ---------------------|                          timespans
                 //                     ---------------------|
                 //                                          -----|
    var expected = '---------------------x-------------------y--#';
    var values = {
      x: ['a', 'b', 'c', 'd', 'e'],
      y: ['e', 'f', 'g', 'h', 'i']
    };
    expectObservable(e1.bufferTime(210, 200, rxTestScheduler)).toBe(expected, values);
  });
});