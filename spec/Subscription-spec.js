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
      }).toThrow(new Rx.UnsubscriptionError([new Error('oops, I am a bad unsubscribe!')]));
      expect(tearDowns).toEqual([1, 2, 3]);
      done();
    });
  });

  it('should not leak when adding a bad custom subscription to a subscription', function (done) {
    var tearDowns = [];

    var sub = new Subscription();

    var source1 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(1);
      };
    });

    var source2 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(2);
        sub.add({
          unsubscribe: function () {
            expect(sub.isUnsubscribed).toBe(true);
            throw new Error('Who is your daddy, and what does he do?');
          }
        });
      };
    });

    var source3 = Observable.create(function (observer) {
      return function () {
        tearDowns.push(3);
      };
    });

    sub.add(Observable.merge(source1, source2, source3).subscribe());

    setTimeout(function () {
      expect(function () {
        sub.unsubscribe();
      }).toThrow(new Rx.UnsubscriptionError([new Error('Who is your daddy, and what does he do?')]));
      expect(tearDowns).toEqual([1, 2, 3]);
      done();
    });
  });
});