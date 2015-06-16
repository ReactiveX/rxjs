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

    it('should invoke the unsubscribe action '+
        'when the subscription has been unsubscribed', function() {
      var called = false;
      var observable = new Observable(function() {
        return function() {
          called = true;
        };   
      });
      var subscription = observable.subscribe(new Observer());

      subscription.unsubscribe();

      expect(called).toBe(true);
    });
  });

  describe('map()', function() {
    it('should change the output value', function(done) {
      var observable = new Observable(function(generator) {
        generator.next(42);
        generator.return(undefined);
      });

      observable.map(function(x) { return x + 1; }).subscribe(Observer.create(function(x) {
          expect(x).toEqual(43);
          done();
      }, null, null));
    });
  });

  describe('flatMap()', function() {
    it('should flatten return observables', function(done) {
      var observable = new Observable(function(generator) {
        generator.next(new Observable(function(gen2) {
          gen2.next(42);
          gen2.return(undefined);
        }));
        generator.return(undefined);
      });

      observable.flatMap(function(x) { return x; })
        .subscribe(function(x) {
          expect(x).toEqual(42);
          done();
        });
    });
  });

  describe('Observable.return(value)', function() {
    it('should return an observable of just that value', function(done) {
      var observable = Observable.return(42);
      var calls = 0;

      observable.subscribe(function(x) {
          expect(x).toEqual(42);
          expect(++calls).toEqual(1);
        },
        null,
        function() {
          done();
        });
    });
  });
});