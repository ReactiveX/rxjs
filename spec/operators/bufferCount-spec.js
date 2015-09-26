/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferCount', function () {
  it('should emit buffers at intervals', function () {
    var values = {
      v: ['a', 'b', 'c'], 
      w: ['c', 'd', 'e'], 
      x: ['e', 'f', 'g'], 
      y: ['g', 'h', 'i'], 
      z: ['i']
    };
    var e1 =   hot('--a--b--c--d--e--f--g--h--i--|');
    var expected = '--------v-----w-----x-----y--(z|)';
    
    expectObservable(e1.bufferCount(3, 2)).toBe(expected, values);
  });
  
  it('should emit buffers at buffersize of intervals if not specified', function () {
    var values = {
      x: ['a', 'b'], 
      y: ['c', 'd'], 
      z: ['e', 'f']
    };
    var e1 =   hot('--a--b--c--d--e--f--|');
    var expected = '-----x-----y-----z--|';
    
    expectObservable(e1.bufferCount(2)).toBe(expected, values);
  });
  
  it('should emit partial buffers if source completes before reaching specified buffer count', function() {
    var e1 =   hot('--a--b--c--d--|');
    var expected = '--------------(x|)';
    
    expectObservable(e1.bufferCount(5)).toBe(expected, {x: ['a', 'b', 'c', 'd']});
  });
  
  it('should emit full buffer then last partial buffer if source completes', function() {
    var e1 =   hot('--a^-b--c--d--e--|');
    var expected =    '--------y-----(z|)';
    
    expectObservable(e1.bufferCount(3)).toBe(expected, {y: ['b', 'c', 'd'], z: ['e']});
  });
  
  it('should raise error if source raise error before reaching specified buffer count', function() {
    var e1 =   hot('--a--b--c--d--#');
    var expected = '--------------#';
    
    expectObservable(e1.bufferCount(5)).toBe(expected);
  });
  
  it('should emit buffers with specified skip count when skip count is less than window count', function() {
    var values = {
      v: ['a', 'b', 'c'], 
      w: ['b', 'c', 'd'], 
      x: ['c', 'd', 'e'], 
      y: ['d', 'e'],
      z: ['e']
    };
    var e1 =   hot('--a--b--c--d--e--|');
    var expected = '--------v--w--x--(yz|)';
    
    expectObservable(e1.bufferCount(3, 1)).toBe(expected, values);
  });
  
  it('should emit buffers with specified skip count when skip count is more than window count', function() {
    var e1 =   hot('--a--b--c--d--e--|');
    var expected = '-----y--------z--|';
    
    expectObservable(e1.bufferCount(2, 3)).toBe(expected, {y: ['a', 'b'], z:['d', 'e']});
  });
});