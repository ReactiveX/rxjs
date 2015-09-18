/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.isEmpty()', function(){
  it('should return true if source is empty', function () {
    var source = hot('-----|');
    var expected =   '-----(x|)';
    
    expectObservable(source.isEmpty()).toBe(expected, { x: true });
  });

  it('should return false if source emits element', function () {
    var source = hot('--a--^--b--|');
    var expected =        '---(x|)';
    
    expectObservable(source.isEmpty()).toBe(expected, { x: false });
  });

  it('should raise error if source raise error', function () {
    var source = hot('--#');
    var expected =   '--#';
    
    expectObservable(source.isEmpty()).toBe(expected);
  });
  
  it('should not completes if source never emits', function () {
    var expected = '-';
    
    expectObservable(Rx.Observable.never().isEmpty()).toBe(expected);
  });
});