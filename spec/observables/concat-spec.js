/* globals describe, it, expect, expectObservable, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.concat', function () {
  it('should emit elements from multiple sources', function () {
    var e1 =  cold('-a-b-c-|');
    var e2 =  cold('-0-1-|');
    var e3 =  cold('-w-x-y-z-|');
    var expected = '-a-b-c--0-1--w-x-y-z-|';

    expectObservable(Observable.concat(e1, e2, e3)).toBe(expected);
  });
});