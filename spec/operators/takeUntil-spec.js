/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.takeUntil()', function () {
  it('should take values until another Observable emits', function () {
    var source = hot('--a--b--c--d--e--f--g--|');
    var other =  hot('-------------z--|');
    var expected =   '--a--b--c--d-|'; 
    
    expectObservable(source.takeUntil(other)).toBe(expected);
  });
});