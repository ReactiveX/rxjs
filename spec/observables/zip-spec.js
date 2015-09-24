/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.zip', function(){
  it('should zip the provided observables', function(done) {
    var expected = ['a1', 'b2', 'c3'];
    var i = 0;

    Observable.zip(
      Observable.fromArray(['a','b','c']),
      Observable.fromArray([1,2,3]),
      function(a, b) {
        return a + b;
      }
    )
    .subscribe(function(x) {
      expect(x).toBe(expected[i++])
    }, null, done);
  });
  
  it('should end once one observable completes and its buffer is empty', function (){
    var e1 =   hot('---a--b--c--|');
    var e2 =   hot('------d----e----f--------|');
    var e3 =   hot('--------h----i----j-------------'); // doesn't complete
    var expected = '--------x----y----(z|)'; // e1 complete and buffer empty
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };
    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
  });
  
  
  it('should end once one observable nexts and zips value from completed other observable whose buffer is empty', function (){
    var e1 =   hot('---a--b--c--|');
    var e2 =   hot('------d----e----f|');
    var e3 =   hot('--------h----i----j-------------'); // doesn't complete
    var expected = '--------x----y----(z|)'; // e2 buffer empty and signaled complete
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };
    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
  });
  
  describe('with iterables', function (){
    it('should zip them with values', function () {
      var myIterator = {
        count: 0,
        next: function (){
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function(){ return this; };
      
      var e1 =   hot('---a---b---c---d---|');
      var expected = '---w---x---y---z---|';
      
      var values = {
        w: ['a', 0],
        x: ['b', 1],
        y: ['c', 2],
        z: ['d', 3]
      };
      
      expectObservable(Observable.zip(e1, myIterator)).toBe(expected, values);
    });
    
    it('should only call `next` as needed', function (){
      var nextCalled = 0;
      var myIterator = {
        count: 0,
        next: function (){
          nextCalled++;
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function(){ return this; };
      
      Observable.zip(Observable.of(1,2,3), myIterator)
        .subscribe();
      
      // since zip will call `next()` in advance, total calls when
      // zipped with 3 other values should be 4.
      expect(nextCalled).toBe(4);
    });
  });
});