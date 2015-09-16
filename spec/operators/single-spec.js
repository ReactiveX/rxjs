/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.single()', function() {
  it('Should raise error from empty predicate if observable does not emit', function() {
    var e1 = hot('--a--^--|');
    var expected =    '---#';
    
    expectObservable(e1.single()).toBe(expected, null, new Rx.EmptyError);
  });
  
  it('Should return only element from empty predicate if observable emits only once', function() {
    var e1 =    hot('--a--|');
    var expected =  '-----(a|)';
    
    expectObservable(e1.single()).toBe(expected);
  });
  
  it('Should raise error from empty predicate if observable emits multiple time', function() {
    var e1 =    hot('--a--b--c--|');
    var expected =  '-----#';
    
    expectObservable(e1.single()).toBe(expected, null, 'Sequence contains more than one element');
  });
  
  it('Should raise error from empty predicate if observable emits error', function() {
    var e1 =    hot('--a--b^--#');
    var expected =        '---#';
    
    expectObservable(e1.single()).toBe(expected);
  });
  
  it('Should raise error from predicate if observable emits error', function() {
    var e1 =    hot('--a--b^--#');
    var expected =        '---#';
    
    var predicate = function (value) { 
      return value === 'c'; 
    }
    
    expectObservable(e1.single(predicate)).toBe(expected);
  });
  
  it('Should raise error if predicate throws error', function() {
    var e1 =    hot('--a--b--c--d--|');
    var expected =  '-----------#';
    
    var predicate = function (value) {
      if (value !== 'd') {
        return false;        
      }
      throw 'error';
    }
    
    expectObservable(e1.single(predicate)).toBe(expected);
  });

  it('Should return element from predicate if observable have single matching element', function() {
    var e1 =    hot('--a--b--c--|');
    var expected =  '-----------(b|)';
    
    var predicate = function (value) { 
      return value === 'b'; 
    }
    
    expectObservable(e1.single(predicate)).toBe(expected);
  });
  
  it('Should raise error from predicate if observable have multiple matching element', function() {
    var e1 =    hot('--a--b--a--b--b--|');
    var expected =  '-----------#';
    
    var predicate = function (value) { 
      return value === 'b'; 
    }
    
    expectObservable(e1.single(predicate)).toBe(expected, null, 'Sequence contains more than one element');
  });
  
  it('Should raise error from predicate if observable does not emit', function() {
    var e1 = hot('--a--^--|');
    var expected =    '---#';
    
    var predicate = function (value) { 
      return value === 'a'; 
    }
    
    expectObservable(e1.single(predicate)).toBe(expected, null, new Rx.EmptyError);
  });
  
  it('Should return undefined from predicate if observable does not contain matching element', function() {
    var e1 =    hot('--a--b--c--|');
    var expected =  '-----------(z|)';
    
    var predicate = function (value) { 
      return value === 'x'; 
    }
    
    expectObservable(e1.single(predicate)).toBe(expected, {z: undefined});
  });
});