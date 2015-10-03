/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Subject = Rx.Subject;

describe('Observable.prototype.multicast()', function () {
  it('should multicast one observable to multiple observers', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
      observer.complete();
    });

    var connectable = source.multicast(function () {
      return new Subject();
    });

    connectable.subscribe(function (x) {
      results1.push(x);
    });

    connectable.subscribe(function (x) {
      results2.push(x);
    });

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    connectable.connect();

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results1).toEqual([1, 2, 3, 4]);
    expect(subscriptions).toBe(1);
    done();
  });

  it('should remove all subscribers from the subject when disconnected', function (done) {
    var subject = new Subject();
    var expected = [1, 2, 3, 4];
    var i = 0;

    var source = Observable.fromArray([1, 2, 3, 4]).multicast(function () {
      //NOTE: This is done for testing only, NEVER do this in prod code, LOL
      return subject;
    });

    source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, function () {
      expect(subject.isUnsubscribed).toBe(true);
      done();
    });

    source.connect();
  });

  it('should allow you to reconnect by subscribing again', function (done) {
    var expected = [1, 2, 3, 4];
    var i = 0;

    var source = Observable.of(1, 2, 3, 4).multicast(function () {
      return new Subject();
    });

    source.subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null,
    function () {
      i = 0;

      source.subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, done);

      source.connect();
    });

    source.connect();
  });
});