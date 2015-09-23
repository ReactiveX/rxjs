/* globals describe, it, expect, expectObservable, hot, cold, lowerCaseO */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.prototype.withLatestFrom()', function () {  
  it('should merge the value with the latest values from the other observables into arrays', function () {
    var e1 =   hot('--a--^---b---c---d--|');
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '----x---y---z--|';
    var values = {
      x: ['b', 'f', 'j'],
      y: ['c', 'g', 'k'],
      z: ['d', 'h', 'l']
    };
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected, values); 
  });
  
  it('should merge the value with the latest values from the other observables into arrays and a project argument', function () {
    var e1 =   hot('--a--^---b---c---d--|');
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '----x---y---z--|';
    var values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    var project = function(a, b, c) { return a + b + c };
    expectObservable(e1.withLatestFrom(e2, e3, project)).toBe(expected, values); 
  });
  
  it('should handle empty', function (){
    var e1 =   Observable.empty();
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '|'; // empty
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected); 
  });
  
  it('should handle never', function (){
    var e1 =   Observable.never();
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '--------------------'; // never
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected); 
  });
  
  it('should handle throw', function (){
    var e1 =   Observable.throw(new Error('sad'));
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '#'; // throw
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected, null, new Error('sad')); 
  });
  
  it('should handle error', function (){
    var e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '----x---#'; // throw
    var values = {
      x: ['b','f','j']
    };
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected, values, new Error('boo-hoo')); 
  });
  
  it('should handle error with project argument', function (){
    var e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    var e2 =   hot('--e--^-f---g---h----|');
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '----x---#'; // throw
    var values = {
      x: 'bfj'
    };
    var project = function(a, b, c) { return a + b + c; };
    expectObservable(e1.withLatestFrom(e2, e3, project)).toBe(expected, values, new Error('boo-hoo')); 
  });
  
  it('should handle merging with empty', function (){
    var e1 =   hot('--a--^---b---c---d--|');
    var e2 =   Observable.empty();
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '---------------|';
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected);     
  });
  
  it('should handle merging with never', function (){
    var e1 =   hot('--a--^---b---c---d--|');
    var e2 =   Observable.never();
    var e3 =   hot('--i--^-j---k---l----|');
    var expected =      '---------------|';
    expectObservable(e1.withLatestFrom(e2, e3)).toBe(expected);     
  });
  
  it('should handle promises', function (done){
    Observable.of(1).delay(1).withLatestFrom(Promise.resolve(2), Promise.resolve(3))
      .subscribe(function(x) {
        expect(x).toEqual([1,2,3]);
      }, null, done);
  });
  
  it('should handle arrays', function() {
    Observable.of(1).delay(1).withLatestFrom([2,3,4], [4,5,6])
      .subscribe(function(x) {
        expect(x).toEqual([1,4,6]);
      });
  });
  
  it('should handle lowercase-o observables', function (){
    Observable.of(1).delay(1).withLatestFrom(lowerCaseO(2, 3, 4), lowerCaseO(4, 5, 6))
      .subscribe(function(x) {
        expect(x).toEqual([1,4,6]);
      });
  });
});