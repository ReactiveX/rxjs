/* globals describe, it, expect, Symbol, expectObservable, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Promise = require('promise');
var Observable = Rx.Observable;
var $$iterator = require('../../dist/cjs/util/SymbolShim').SymbolShim.iterator;

describe('Observable.from', function () {
  it('should enumerate an Array', function (done) {
    var expected = [1, 2, 3];
    var i = 0;
    Observable.from(expected).subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  }, 300);

  it('should handle an ArrayLike', function (done) {
    var arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    var expected = [1, 2, 3];
    var i = 0;
    Observable.from(arrayLike).subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  }, 300);

  it('should handle an ArrayLike from arguments', function (done) {
    function makeArrayLike() {
      var expected = [1, 2, 3];
      var i = 0;

      Observable.from(arguments).subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, done);
    }

    makeArrayLike(1, 2, 3);
  }, 300);

  it('should handle an ArrayLike with a mapFn', function (done) {
    var arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    var expected = [1, 1, 1];
    var i = 0;
    var mapFn = function (v, k) {
      return v - k;
    };
    Observable.from(arrayLike, mapFn).subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  }, 300);

  it('should handle an ArrayLike with a thisArg', function (done) {
    var arrayLike = {
      length: 3,
      0: 1,
      1: 2,
      2: 3
    };
    var expected = [123, 123, 123];
    var i = 0;
    var mapFn = function (x, y) {
      return this.thing;
    };
    Observable.from(arrayLike, mapFn, {thing: 123}).subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });

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
        subscribe: function (observer) {
          observer.next('test');
          observer.complete();
        }
      };
    };

    Observable.from(observablesque).subscribe(function (x) {
      expect(x).toBe('test');
    }, null, done);
  });

  it('should accept scheduler for observableque object', function () {
    var observablesque = {};

    observablesque[Symbol.observable] = function () {
      return {
        subscribe: function (observer) {
          observer.next('x');
          observer.complete();
        }
      };
    };

    var e1 = Observable.from(observablesque, rxTestScheduler);
    var expected = '(x|)';

    expectObservable(e1).toBe(expected);
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
        next: function () {
          return iteratorResults.shift();
        }
      };
    };

    Observable.from(iterable).subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, done);
  });

  it('should throw for non observable object', function () {
    var r = function () {
      Observable.from({}).subscribe();
    };

    expect(r).toThrow();
  });

  it('should handle object has observable symbol', function (done) {
    var value = 'x';

    Observable.from(Observable.of(value)).subscribe(function (x) {
      expect(x).toBe(value);
    }, function (err) {
      done.fail('should not be called');
    }, done);
  });
});
