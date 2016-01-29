/* globals jasmine, describe, it, expect, spyOn, expectObservable, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Observer = Rx.Observer;

describe('Observable.interval', function () {
  it('should set up an interval', function () {
    var expected = '----------0---------1---------2---------3---------4---------5---------6-----';
    expectObservable(Observable.interval(100, rxTestScheduler)).toBe(expected, [0,1,2,3,4,5,6]);
  });

  it('should specify default scheduler if incorrect scheduler specified', function () {
    var scheduler = Observable.interval(10, jasmine.createSpy('dummy')).scheduler;

    expect(scheduler).toBe(Rx.Scheduler.asap);
  });

  it('should emit when relative interval set to zero', function () {
    var e1 = Observable.interval(0, rxTestScheduler).take(7);
    var expected = '(0123456|)';

    expectObservable(e1).toBe(expected, [0,1,2,3,4,5,6]);
  });

  it('should consider negative interval as zero', function () {
    var e1 = Observable.interval(-1, rxTestScheduler).take(7);
    var expected = '(0123456|)';

    expectObservable(e1).toBe(expected, [0,1,2,3,4,5,6]);
  });

  it('should emit values until unsubscribed', function (done) {
    var expected = [0,1,2,3,4,5,6];
    var e1 = Observable.interval(5);
    var subscription = e1.subscribe(function (x) {
      expect(x).toBe(expected.shift());

      if (x === 6) {
        subscription.unsubscribe();
        expect(expected).toEqual([]);
        done();
      }
    }, function (x) {
      done.fail('should not be called');
    }, function () {
      done.fail('should not be called');
    });
  });
});
