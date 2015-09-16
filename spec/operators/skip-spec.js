/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skip()', function () {
  it('should skip values before a total', function () {
    var source = hot('--a--b--c--d--e--|');
    var expected =   '-----------d--e--|';
    
    expectObservable(source.skip(3)).toBe(expected);
  });
  
   it('should skip all values without error if total is more than actual number of values', function () {
    var source = hot('--a--b--c--d--e--|');
    var expected =   '-----------------|';
    
    expectObservable(source.skip(6)).toBe(expected);
  });
});