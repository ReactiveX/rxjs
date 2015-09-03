/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');

var Observable = Rx.Observable;

describe('Observable', function () {
  it('should be constructed with a subscriber function', function (done) {
    var source = new Observable(function (observer) {
      expectFullObserver(observer);
      observer.next(1);
      observer.complete();
    });

    source.subscribe(function (x) { expect(x).toBe(1); }, null, done);
  });
  
  describe('subscribe', function () {
    it('should be synchronous', function () {
      var subscribed = false;
      var nexted, completed;
      var source = new Observable(function (observer) {
        subscribed = true;
        observer.next('wee');
        expect(nexted).toBe('wee');
        observer.complete();
        expect(completed).toBe(true);
      });
      expect(subscribed).toBe(false);
      
      var mutatedByNext = false;
      var mutatedByComplete = false;
      
      source.subscribe(function (x) {
        nexted = x;
        mutatedByNext = true;
      }, null, function () {
        completed = true;
        mutatedByComplete = true;
      });
      
      expect(mutatedByNext).toBe(true);
      expect(mutatedByComplete).toBe(true);
    });
    
    it('should return a Subscription that calls the unsubscribe function returned by the subscriber', function () {
      var unsubscribeCalled = false;
      
      var source = new Observable(function () {
        return function () {
          unsubscribeCalled = true;
        };
      });
      
      var sub = source.subscribe(function () { });
      expect(sub instanceof Rx.Subscription).toBe(true);
      expect(unsubscribeCalled).toBe(false);
      expect(typeof sub.unsubscribe).toBe('function');
      
      sub.unsubscribe();
      expect(unsubscribeCalled).toBe(true);
    });
  });
});

describe('Observable.create', function () {
  it('should create an Observable', function () {
    var result = Observable.create(function () { });
    expect(result instanceof Observable).toBe(true);
  });
  
  it('should provide an observer to the function', function () {
    var called = false;
    var result = Observable.create(function (observer) {
      called = true;
      expectFullObserver(observer);
      observer.complete();
    });
    
    expect(called).toBe(false);
    result.subscribe(function () { });
    expect(called).toBe(true);
  });
});

function expectFullObserver(val) {
  expect(typeof val).toBe('object');
  expect(typeof val.next).toBe('function');
  expect(typeof val.error).toBe('function');
  expect(typeof val.complete).toBe('function');
  expect(typeof val.isUnsubscribed).toBe('boolean');
}