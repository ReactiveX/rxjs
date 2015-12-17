/* globals describe, it, expect, expectObservable, expectSubscription, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Scheduler = Rx.Scheduler;

describe('Observable.prototype.throttleTime()', function () {
  it.asDiagram('throttleTime(50)')('should immediately emit the first value in each time window', function () {
    var e1 =   hot('-a-x-y----b---x-cx---|');
    var subs =     '^                    !';
    var expected = '-a--------b-----c----|';

    var result = e1.throttleTime(50, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle events by 50 time units', function (done) {
    Observable.of(1, 2, 3).throttleTime(50)
      .subscribe(function (x) {
        expect(x).toBe(1);
      }, null, done);
  });

  it('should throttle events multiple times', function (done) {
    var expected = ['1-0', '2-0'];
    Observable.concat(
      Observable.timer(0, 10).take(3).map(function (x) { return '1-' + x; }),
      Observable.timer(80, 10).take(5).map(function (x) { return '2-' + x; })
      )
      .throttleTime(50)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });

  it('should simply mirror the source if values are not emitted often enough', function () {
    var e1 =   hot('-a--------b-----c----|');
    var subs =     '^                    !';
    var expected = '-a--------b-----c----|';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', function () {
    var e1 =   hot('abcdefabcdefabcdefabcdefa|');
    var subs =     '^                        !';
    var expected = 'a-----a-----a-----a-----a|';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', function () {
    var e1 =   hot('-----|');
    var subs =     '^    !';
    var expected = '-----|';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', function () {
    var e1 =   hot('-----#');
    var subs =     '^    !';
    var expected = '-----#';

    expectObservable(e1.throttleTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', function () {
    var e1 =  cold('|');
    var subs =     '(^!)';
    var expected = '|';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', function () {
    var e1 =  cold('-');
    var subs =     '^';
    var expected = '-';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', function () {
    var e1 =  cold('#');
    var subs =     '(^!)';
    var expected = '#';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle and does not complete when source does not completes', function () {
    var e1 =   hot('-a--(bc)-------d----------------');
    var unsub =    '                               !';
    var subs =     '^                              !';
    var expected = '-a-------------d----------------';

    expectObservable(e1.throttleTime(50, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   hot('-a--(bc)-------d----------------');
    var subs =     '^                              !';
    var expected = '-a-------------d----------------';
    var unsub =    '                               !';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .throttleTime(50, rxTestScheduler)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle values until source raises error', function () {
    var e1 =   hot('-a--(bc)-------d---------------#');
    var subs =     '^                              !';
    var expected = '-a-------------d---------------#';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});