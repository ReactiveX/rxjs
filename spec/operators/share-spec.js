/* globals describe, expect, it, hot, cold, expectObservable */

var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.share()', function (){
  it('should share a single subscription', function (){
    var subscriptionCount = 0;
    var obs = new Observable(function(observer){
      subscriptionCount++;
    });
    
    var source = obs.share();
    
    expect(subscriptionCount).toBe(0);
    
    source.subscribe();
    source.subscribe();
    
    expect(subscriptionCount).toBe(1);
  });
  
  it('should not change the output of the observable when successful', function (){ 
    var e1 = hot('---a--^--b--c--d--e--|');
    var expected =     '---b--c--d--e--|';
    
    expectObservable(e1.share()).toBe(expected);
  });
  
  it('should not change the output of the observable when error', function (){ 
    var e1 = hot('---a--^--b--c--d--e--#');
    var expected =     '---b--c--d--e--#';
    
    expectObservable(e1.share()).toBe(expected);
  });
  
   it('should not change the output of the observable when successful with cold observable', function (){ 
    var e1 =  cold('---a--b--c--d--e--|');
    var expected = '---a--b--c--d--e--|';
    
    expectObservable(e1.share()).toBe(expected);
  });
  
  it('should not change the output of the observable when error with cold observable', function (){ 
    var e1 =  cold('---a--b--c--d--e--#');
    var expected = '---a--b--c--d--e--#';
    
    expectObservable(e1.share()).toBe(expected);
  });
  
  it('should not change the output of the observable when never', function (){ 
    var e1 = Observable.never();
    var expected = '-';
    
    expectObservable(e1.share()).toBe(expected);
  });
  
  it('should not change the output of the observable when empty', function (){ 
    var e1 = Observable.empty();
    var expected = '|';
    
    expectObservable(e1.share()).toBe(expected);
  });
});