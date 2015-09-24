/* globals describe, it, expect, hot, expectObservable */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.findIndex()', function() {
  function truePredicate(x) {
    return true;
  }

  it("should not emit if source does not emit", function() {
    var source = hot('-');
    var expected =   '-';
    
    expectObservable(source.findIndex(truePredicate)).toBe(expected);
  });
  
  it('should return negative index if source is empty to match predicate', function() {
    var expected = '(x|)';
    
    expectObservable(Observable.empty().findIndex(truePredicate)).toBe(expected, {x: -1});
  });
  
  it('should return index of element from source emits single element', function() {
    var sourceValue = 1;
    var source = hot('--a--|', { a: sourceValue });
    var expected =   '--(x|)';
    
    var predicate = function(value) {
      return value === sourceValue;
    }
    
    expectObservable(source.findIndex(predicate)).toBe(expected, { x: 0 });
  });
  
  it('should return negative index if element does not match with predicate', function() {
    var source = hot('--a--b--c--|');
    var expected =   '-----------(x|)';
    
    var predicate = function(value) {
      return value === 'z';
    }
    
    expectObservable(source.findIndex(predicate)).toBe(expected, { x: -1 });
  });
  
  it('should raise if source raise error while element does not match with predicate', function() {
    var source = hot('--a--b--#');
    var expected =   '--------#';
    
    var predicate = function(value) {
      return value === 'z';
    }
    
    expectObservable(source.findIndex(predicate)).toBe(expected);
  });
  
  it('should raise error if predicate throws error', function() {
    
    var source = hot('--a--b--c--|');
    var expected =   '--#';
    
    var predicate = function(value) {
      throw 'error';
    }
    
    expectObservable(source.findIndex(predicate)).toBe(expected);
  });
});