/* globals describe, it, expect */
var Rx = require('../dist/cjs/Rx');
var Subscription = Rx.Subscription;
var Observable = Rx.Observable;

describe('Subscription', function () {
  it('should not leak', function (done) {
    var tearDowns = [];

    var source1 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(1);
      };
    });

    var source2 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(2);
        throw new Error('oops, I am a bad unsubscribe!');
      };
    });

    var source3 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(3);
      };
    });

    var subscription = Observable.merge(source1, source2, source3).subscribe();

    setTimeout(function () {
      expect(function () {
        subscription.unsubscribe();
      }).toThrow();
      expect(tearDowns).toEqual([1, 2, 3]);
      done();
    });
  });
});