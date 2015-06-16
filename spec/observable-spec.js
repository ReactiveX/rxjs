/* globals RxNext, describe, it, iit, expect, jasmine */

var RxNext = require('../dist/cjs/RxNext');

var Observable = RxNext.Observable;
var Subscription = RxNext.Subscription;
var Observer = RxNext.Observer;

describe('Observable', function() {
  it('should exist', function() {
    expect(typeof Observable).toEqual('function');
  });

  describe('subscribe(observer)', function() {
    it('should return a subscription', function() {
      var observable = new Observable(function() {});
      var subref = observable.subscribe({});
      expect(subref instanceof Subscription).toEqual(true);
    });
  });

  describe('map()', function() {
    it('should change the output value', function() {
      var observable = new Observable(function(generator) {
        generator.next(42);
        generator.return(undefined);
      });
      observable.map(function(x) { return x + 1; }).subscribe(function(x) {
          expect(x).toEqual(43);
      }, null, null);
    });
  });

  describe('flatMap()', function() {
    it('should flatten return observables', function() {
      var observable = new Observable(function(generator) {
        generator.next(new Observable(function(gen2) {
          gen2.next(42);
          gen2.return(undefined);
        }));
        generator.return(undefined);
      });

      observable.flatMap(function(x) { return x; }).subscribe(function(x) {
          expect(x).toEqual(42);
        }, null, null);
    });
  });

  describe('Observable.return(value)', function() {
    it('should return an observable of just that value', function() {
      var observable = Observable.return(42);
      var calls = 0;
      observable.subscribe(function(x) {
          expect(x).toEqual(42);
          expect(++calls).toEqual(1);
        },
        null, null);
    });
  });
});