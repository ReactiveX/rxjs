/* globals RxNext, describe, it, iit, expect */
var Observable = require('../dist/cjs/Observable');
var Subscription = require('../dist/cjs/Subscription');
var Observer = require('../dist/cjs/Observer');

describe('Observable', function() {
  it('should exist', function() {
    expect(typeof Observable).toEqual('function');
  });

  describe('subscribe(generator)', function() {
    it('should return a subscription', function() {
      var observable = new Observable(function() {});
      var subref = observable.subscribe({});
      expect(subref instanceof Subscription).toEqual(true);
    });

    it('should invoke the unsubscribe action '+
        'when the subscription has been unsubscribed', function() {
      var unsubscribeAction = jasmine.createSpy("unsubscribeAction");
      var observable = new Observable(function() { return unsubscribeAction; });
      var subscription = observable.subscribe({});

      subscription.unsubscribe();

      expect(unsubscribeAction).toHaveBeenCalled();
    });

    it('should not call methods on the subscribe '+
       'after the subscription has been unsubscribed', function() {
      var generator;
      var observable = new Observable(function(g) {generator = g;});
      var subscription = observable.subscribe(
        Observer.create(function() {throw 'Should not be called';},
        function() {throw 'Should not be called';},
        function() {throw 'Should not be called';}));

      subscription.unsubscribe();

      expect(function() { return generator.next(42); }).not.toThrow();
      expect(function() { return generator.throw(new Error()); }).not.toThrow();
      expect(function() { return generator.return(42); }).not.toThrow();
    });
  });

  describe('map()', function() {
    it('should change the output value', function(done) {
      var observable = new Observable(function(generator) {
        generator.next(42);
        generator.return(undefined);
      });

      observable.map(function(x) { return x + 1; }).subscribe({
        next: function(x) {
          expect(x).toEqual(43);
          done();
        }
      });
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

      observable.flatMap(function(x) { return x; }).subscribe({
        next: function(x) {
          expect(x).toEqual(42);
          done();
        }
      });
    });
  });

  describe('Observable.return(value)', function() {
    it('should return an observable of just that value', function(done) {
      var observable = Observable.return(42);
      var calls = 0;

      observable.subscribe({
        next: function(x) {
          expect(x).toEqual(42);
          expect(++calls).toEqual(1);
        },

        return: function() {
          done();
        }
      });
    });
  });
});