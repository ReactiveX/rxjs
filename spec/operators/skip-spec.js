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
  
  it('should skip all values without error if total is same as actual number of values', function () {
    var source = hot('--a--b--c--d--e--|');
    var expected =   '-----------------|';
    
    expectObservable(source.skip(5)).toBe(expected);
  });
  
  it('should not skip if count is zero', function () {
    var source = hot('--a--b--c--d--e--|');
    var expected =   '--a--b--c--d--e--|';
    
    expectObservable(source.skip(0)).toBe(expected);
  });
  
  it('should raise error if skip count is more than actual number of emits and source raises error', function() {
    var source = hot('--a--b--c--d--#');
    var expected =   '--------------#';
    
    expectObservable(source.skip(6)).toBe(expected);
  });
  
  it('should raise error if skip count is same as emits of source and source raises error', function() {
    var source = hot('--a--b--c--d--#');
    var expected =   '--------------#';
    
    expectObservable(source.skip(4)).toBe(expected);
  });
  
  it('should skip values before a total and raises error if source raises error', function() {
    var source = hot('--a--b--c--d--#');
    var expected =   '-----------d--#';
    
    expectObservable(source.skip(3)).toBe(expected);
  });
  
  it('should complete regardless of skip count if source is empty', function() {
    var e1 = Observable.empty();
    var expected = '|';
    
    expectObservable(e1.skip(3)).toBe(expected);
  });
  
  it('should not complete if source never completes without emit', function() {
    var e1 = hot('-');
    var expected = '-';
    
    expectObservable(e1.skip(3)).toBe(expected);
  });
  
  it('should skip values before total and never completes if source emits and does not complete', function() {
    var e1 =   hot('--a--b--c-');
    var expected = '-----b--c-';
    
    expectObservable(e1.skip(1)).toBe(expected);
  });
  
  it('should skip all values and never completes if total is more than numbers of value and source does not complete', function() {
    var e1 =   hot('--a--b--c-');
    var expected = '-';
    
    expectObservable(e1.skip(6)).toBe(expected);
  });
  
  it('should skip all values and never completes if total is same asnumbers of value and source does not complete', function() {
    var e1 =   hot('--a--b--c-');
    var expected = '-';
    
    expectObservable(e1.skip(3)).toBe(expected);
  });
  
  it('should raise error if source throws', function(){
    var error = 'error';
    var e1 = Observable.throw(error);
    var expected = '#';
    
    expectObservable(e1.skip(3)).toBe(expected, null, error);
  });
});