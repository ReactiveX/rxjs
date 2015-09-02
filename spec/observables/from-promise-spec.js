/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.fromPromise', function(){
  it('should emit one value from that promise', function(done) {
    var promise = Promise.resolve(42);
    Observable.from(promise)
      .subscribe(function(x) {
        expect(x).toBe(42);
      }, null,
      function(x) {
        expect(x).toBe(undefined);
        done();
      });
  });

  it('should not emit, throw or complete if immediately unsubscribed', function(done){
    var nextSpy = jasmine.createSpy('next');
    var throwSpy = jasmine.createSpy('throw');
    var completeSpy = jasmine.createSpy('complete');
    var promise = Promise.resolve(42);
    var subscription = Observable.from(promise)
      .subscribe(nextSpy, throwSpy, completeSpy);
    subscription.unsubscribe();

    setTimeout(function() {
      expect(nextSpy).not.toHaveBeenCalled();
      expect(throwSpy).not.toHaveBeenCalled();
      expect(completeSpy).not.toHaveBeenCalled();
      done();
    });
  });
});