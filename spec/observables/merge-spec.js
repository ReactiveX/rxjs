/* globals expect, it, describe, hot, cold, expectObservable */

var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.merge(...observables)', function() {
  it('should merge cold and cold', function() {
    var e1 =  cold('---a-----b-----c----|');
    var e2 =  cold('------x-----y-----z----|');
    var expected = '---a--x--b--y--c--z----|';
    expectObservable(Observable.merge(e1, e2)).toBe(expected);
  });
  
  it('should merge hot and hot', function() {
    var e1 =  hot('---a---^-b-----c----|');
    var e2 =  hot('-----x-^----y-----z----|');
    var expected =       '--b--y--c--z----|';
    expectObservable(Observable.merge(e1, e2)).toBe(expected);
  });
  
  it('should merge hot and cold', function(){
    var e1 =  hot('---a-^---b-----c----|');
    var e2 =  cold(    '--x-----y-----z----|');
    var expected =     '--x-b---y-c---z----|';
    expectObservable(Observable.merge(e1, e2)).toBe(expected);
  });
  
  it('should merge parallel emissions', function(){
    var e1 =   hot('---a----b----c----|');
    var e2 =   hot('---x----y----z----|');
    var expected = '---(ax)-(by)-(cz)-|';
    expectObservable(Observable.merge(e1, e2)).toBe(expected);
  });
  
  it('should merge empty and empty', function(){
    var e1 = Observable.empty();
    var e2 = Observable.empty();
    expectObservable(Observable.merge(e1, e2)).toBe('|');
  });
  
  it('should merge never and empty', function(){
    var e1 = Observable.never();
    var e2 = Observable.empty();
    expectObservable(Observable.merge(e1, e2)).toBe('-');
  }); 
  
  it('should merge never and never', function(){
    var e1 = Observable.never();
    var e2 = Observable.never();
    expectObservable(Observable.merge(e1, e2)).toBe('-');
  });
  
  it('should merge empty and throw', function(){
    var e1 = Observable.empty();
    var e2 = Observable.throw(new Error('blah'));
    expectObservable(Observable.merge(e1, e2)).toBe('#', undefined, new Error('blah'));
  });
  
  it('should merge hot and throw', function(){
    var e1 = hot('--a--b--c--|');
    var e2 = Observable.throw(new Error('blah'));
    expectObservable(Observable.merge(e1, e2)).toBe('#', undefined, new Error('blah'));
  });
  
  it('should merge never and throw', function(){
    var e1 = Observable.never();
    var e2 = Observable.throw(new Error('blah'));
    expectObservable(Observable.merge(e1, e2)).toBe('#', undefined, new Error('blah'));
  });
  
  
  it('should merge empty and error', function(){
    var e1 = Observable.empty();
    var e2 =    hot('-------#', undefined, new Error('blah'));
    var expected =  '-------#';
    expectObservable(Observable.merge(e1, e2)).toBe(expected, undefined, new Error('blah'));
  });
  
  it('should merge hot and error', function(){
    var e1 =   hot('--a--b--c--|');
    var e2 =   hot('-------#', undefined, new Error('blah'));
    var expected = '--a--b-#';
    expectObservable(Observable.merge(e1, e2)).toBe(expected, undefined, new Error('blah'));
  });
  
  it('should merge never and error', function(){
    var e1 = Observable.never();
    var e2 =    hot('-------#', undefined, new Error('blah'));
    var expected =  '-------#';
    expectObservable(Observable.merge(e1, e2)).toBe(expected, undefined, new Error('blah'));
  });
});

describe('Observable.merge(number, ...observables)', function(){
  it('should handle concurrency limits', function () {
    var e1 =  cold('---a---b---c---|');
    var e2 =  cold('-d---e---f--|');
    var e3 =  cold(            '---x---y---z---|');
    var expected = '-d-a-e-b-f-c---x---y---z---|';
    expectObservable(Observable.merge(e1, e2, e3, 2)).toBe(expected);
  });
});