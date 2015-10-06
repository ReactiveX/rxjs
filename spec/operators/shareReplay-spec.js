/* globals describe, expect, it, hot, cold, expectObservable */

var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.shareReplay()', function () {
  it('should share a single subscription', function () {
    var subscriptionCount = 0;
    var obs = new Observable(function (observer) {
      subscriptionCount++;
    });

    var source = obs.shareReplay(1);

    expect(subscriptionCount).toBe(0);

    source.subscribe();
    source.subscribe();

    expect(subscriptionCount).toBe(1);
  });

  it('should replay as many events as specified by the bufferSize', function (done) {
    var results1 = [];
    var results2 = [];
    var subscriptions = 0;

    var source = new Observable(function (observer) {
      subscriptions++;
      observer.next(1);
      observer.next(2);
      observer.next(3);
      observer.next(4);
    });

    var hot = source.shareReplay(2);

    expect(results1).toEqual([]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results1.push(x);
    });

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([]);

    hot.subscribe(function (x) {
      results2.push(x);
    });

    expect(results1).toEqual([1, 2, 3, 4]);
    expect(results2).toEqual([3, 4]);
    expect(subscriptions).toBe(1);
    done();
  });

  it('should not change the output of the observable when successful', function () {
    var e1 = hot('---a--^--b-c--d--e--|');
    var expected =     '---b-c--d--e--|';

    expectObservable(e1.shareReplay(1)).toBe(expected);
  });

  it('should not change the output of the observable when error', function () {
    var e1 = hot('---a--^--b-c--d--e--#');
    var expected =     '---b-c--d--e--#';

    expectObservable(e1.shareReplay(1)).toBe(expected);
  });

  it('should not change the output of the observable when never', function () {
    var e1 = Observable.never();
    var expected = '-';

    expectObservable(e1.shareReplay(1)).toBe(expected);
  });

  it('should not change the output of the observable when empty', function () {
    var e1 = Observable.empty();
    var expected = '|';

    expectObservable(e1.shareReplay(1)).toBe(expected);
  });
});
