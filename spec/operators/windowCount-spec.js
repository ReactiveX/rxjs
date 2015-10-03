/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.windowCount', function () {
  function mergeMapfunction(x) {
    return x.toArray();
  }

  it('should emit windows at intervals', function () {
    var e1 =   hot('--a--b--c--d--|');
    var expected = '-----w--x--y--(z|)';

    expectObservable(e1.windowCount(2,1).mergeMap(mergeMapfunction))
      .toBe(expected, { w: ['a', 'b'], x: ['b', 'c'], y: ['c', 'd'], z: ['d'] });
  });

  it('should emit buffers at buffersize of intervals if not specified', function () {
    var e1 =   hot('--a--b--c--d--e--f--|');
    var expected = '-----x-----y-----z--|';

    expectObservable(e1.windowCount(2).mergeMap(mergeMapfunction))
      .toBe(expected, { x: ['a', 'b'], y: ['c', 'd'], z: ['e', 'f']});
  });

  it('should raises error if source raises error', function () {
    var e1 =   hot('--a--b--c--d--e--f--#');
    var expected = '--------w--x--y--z--#';

    expectObservable(e1.windowCount(3,1).mergeMap(mergeMapfunction))
      .toBe(expected, { w: ['a', 'b', 'c'], x: ['b', 'c', 'd'], y: ['c', 'd', 'e'], z: ['d', 'e', 'f'] });
  });
});