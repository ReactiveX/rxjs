/* globals describe, it, expect, Symbol */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');
var Observable = Rx.Observable;
var $$iterator = require('../../dist/cjs/util/Symbol_iterator');

describe('Observable.from', function () {
  it('should enumerate an Array', function (done) {
    var expected = [1, 2, 3];
    var i = 0;
    Observable.from(expected).subscribe(function (x) {
        expect(x).toBe(expected[i++])
      }, null, done);
  }, 300);
  
  it('should handle a promise', function (done) {
    var promise = Promise.resolve('pinky swear');
    
    Observable.from(promise).subscribe(function (x) {
      expect(x).toBe('pinky swear');
    }, null, done);
  });
  
  it('should handle an "observableque" object', function (done) {
    var observablesque = {};
    
    observablesque[Symbol.observable] = function () {
      return {
        subscribe: function(observer) {
          observer.next('test');
          observer.complete();
        }
      };
    };

    Observable.from(observablesque).subscribe(function (x) {
      expect(x).toBe('test');
    }, null, done);
  });
  
  it('should handle a string', function (done) {
    var expected = ['a', 'b', 'c'];
    Observable.from('abc').subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
  
  it('should handle any iterable thing', function (done) {
    var iterable = {};
    var iteratorResults = [
      { value: 'one', done: false },
      { value: 'two', done: false },
      { done: true }
    ];
    var expected = ['one', 'two'];
    
    expect($$iterator).toBe(Symbol.iterator);
    
    iterable[Symbol.iterator] = function () {
      return {
        next: function() {
          return iteratorResults.shift();
        }
      }
    };

    Observable.from(iterable).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });
});