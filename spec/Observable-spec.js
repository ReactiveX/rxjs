/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');
var Promise = require('promise');
var Observable = Rx.Observable;

function expectFullObserver(val) {
  expect(typeof val).toBe('object');
  expect(typeof val.next).toBe('function');
  expect(typeof val.error).toBe('function');
  expect(typeof val.complete).toBe('function');
  expect(typeof val.isUnsubscribed).toBe('boolean');
}

describe('Observable', function () {
  it('should be constructed with a subscriber function', function (done) {
    var source = new Observable(function (observer) {
      expectFullObserver(observer);
      observer.next(1);
      observer.complete();
    });

    source.subscribe(function (x) { expect(x).toBe(1); }, null, done);
  });

  describe('forEach', function () {
    it('should iterate and return a Promise', function (done) {
      var expected = [1,2,3];
      var result = Observable.of(1,2,3).forEach(function (x) {
        expect(x).toBe(expected.shift());
      }, null, Promise)
      .then(done);

      expect(typeof result.then).toBe('function');
    });

    it('should reject promise when in error', function (done) {
      Observable.throw('bad').forEach(function (x) {
        done.fail('should not be called');
      }, null, Promise).then(function () {
        done.fail('should not complete');
      }, function (err) {
        expect(err).toBe('bad');
        done();
      }, null, Promise);
    });

    it('should allow Promise to be globally configured', function (done) {
      var wasCalled = false;
      __root__.Rx = {};
      __root__.Rx.config = {};
      __root__.Rx.config.Promise = function MyPromise(callback) {
        wasCalled = true;
        return new Promise(callback);
      };

      Observable.of(42).forEach(function (x) {
        expect(x).toBe(42);
      }).then(function () {
        expect(wasCalled).toBe(true);
        done();
      });
    });

    it('should accept a thisArg argument', function (done) {
      var expected = [1,2,3];
      var thisArg = {};
      var result = Observable.of(1,2,3).forEach(function (x) {
        expect(this).toBe(thisArg);
        expect(x).toBe(expected.shift());
      }, thisArg, Promise)
      .then(done);

      expect(typeof result.then).toBe('function');
    });
  });

  describe('subscribe', function () {
    it('should be synchronous', function () {
      var subscribed = false;
      var nexted;
      var completed;
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

    describe('when called with an anonymous observer', function () {
      it('should accept an anonymous observer with just a next function', function () {
        Observable.of(1).subscribe({
          next: function next(x) {
            expect(x).toBe(1);
          }
        });
      });

      it('should accept an anonymous observer with just an error function', function () {
        Observable.throw('bad').subscribe({
          error: function error(err) {
            expect(err).toBe('bad');
          }
        });
      });

      it('should accept an anonymous observer with just a complete function', function (done) {
        Observable.empty().subscribe({
          complete: function complete() {
            done();
          }
        });
      });

      it('should accept an anonymous observer with no functions at all', function () {
        expect(function testEmptyObject() {
          Observable.empty().subscribe({});
        }).not.toThrow();
      });
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
