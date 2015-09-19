/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.prototype.switchMap()', function () {
  it("should switch with a selector function", function (done) {
    var a = Observable.of(1, 2, 3);
    var expected = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'];
    a.switchMap(function(x) {
      return Observable.of('a' + x, 'b' + x, 'c' + x);
    }).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
  
  it('should unsub inner observables', function(){
    var unsubbed = [];
    
    Observable.of('a', 'b').switchMap(function(x) {
      return Observable.create(function(subscriber) {
        subscriber.complete();
        return function() {
          unsubbed.push(x);
        };
      });
    }).subscribe();
    
    expect(unsubbed).toEqual(['a', 'b']);
  });

  it('should switch inner cold observables', function (){
    var x =   cold(         '--a--b--c--d--e--|')
    var y =   cold(                   '---f---g---h---i--|');
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------a--b--c----f---g---h---i--|';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected);    
  });
  
  it('should switch inner hot observables', function (){
    var x =    hot('-----a--b--c--d--e--|')
    var y =    hot('--p-o-o-p-------------f---g---h---i--|');
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------c--d--e----f---g---h---i--|';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected);    
  });
  
  it('should switch inner empty and empty', function () {
    var x = Observable.empty();
    var y = Observable.empty();
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------------------------|';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected);    
  });
  
  it('should switch inner empty and never', function() {
    var x =   Observable.empty()
    var y =   Observable.never();
    var e1 =   hot('---------x---------y---------|');
    var expected = '----------------------------------';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected);    
  });
  
  it('should switch inner never and empty', function (){
    var x = Observable.never();
    var y = Observable.empty();
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------------------------|';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected);    
  });
  
  it('should switch inner never and throw', function (){
    var x = Observable.never();
    var y = Observable.throw(new Error('sad'));
    var e1 =   hot('---------x---------y---------|');
    var expected = '-------------------#';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected, undefined, new Error('sad'));    
  });
  
  it('should switch inner empty and throw', function (){
    var x = Observable.empty();
    var y = Observable.throw(new Error('sad'));
    var e1 =   hot('---------x---------y---------|');
    var expected = '-------------------#';
    
    var observableLookup = { x: x, y: y };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected, undefined, new Error('sad'));    
  });
  
  it('should handle outer empty', function (){
    var e1 = Observable.empty();
    var expected = '|';
    expectObservable(e1.switchMap(function(value) {
      return Observable.of(value);
    })).toBe(expected);
  });
  
  it('should handle outer never', function (){
    var e1 = Observable.never();
    var expected = '----';
    expectObservable(e1.switchMap(function(value) {
      return Observable.of(value);
    })).toBe(expected);
  });
  
  it('should handle outer throw', function (){
    var e1 = Observable.throw(new Error('wah'));
    var expected = '#';
    expectObservable(e1.switchMap(function(value) {
      return Observable.of(value);
    })).toBe(expected, undefined, new Error('wah'));
  });
  
  it('should handle outer error', function (){
    var x =   cold(         '--a--b--c--d--e--|')
    var e1 =   hot('---------x---------#', undefined, new Error('boo-hoo'));
    var expected = '-----------a--b--c-#';
    
    var observableLookup = { x: x };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    })).toBe(expected, undefined, new Error('boo-hoo'));    
  });
  
  it('should switch with resultSelector goodness', function (){
    var x =   cold(         '--a--b--c--d--e--|')
    var y =   cold(                   '---f---g---h---i--|');
    var e1 =   hot('---------x---------y---------|');
    var expected = '-----------a--b--c----f---g---h---i--|';
    
    var observableLookup = { x: x, y: y };
    
    var expectedValues = {
      a: ['a', 'x', 0, 0],
      b: ['b', 'x', 1, 0],
      c: ['c', 'x', 2, 0],
      f: ['f', 'y', 0, 1],
      g: ['g', 'y', 1, 1],
      h: ['h', 'y', 2, 1],
      i: ['i', 'y', 3, 1]
    };
    
    expectObservable(e1.switchMap(function(value) {
      return observableLookup[value];
    }, function(innerValue, outerValue, innerIndex, outerIndex) {
      return [innerValue, outerValue, innerIndex, outerIndex];
    })).toBe(expected, expectedValues);    
  });
});