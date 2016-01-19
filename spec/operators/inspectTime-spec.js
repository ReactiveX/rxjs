/* globals describe, it, expect, expectObservable, expectSubscription, hot, cold, rxTestScheduler, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Scheduler = Rx.Scheduler;

describe('Observable.prototype.inspectTime()', function () {
  it.asDiagram('inspectTime(50)')('should emit the last value in each time window', function () {
    var e1 =   hot('-a-x-y----b---x-cx---|');
    var subs =     '^                    !';
    var expected = '------y--------x-----|';

    var result = e1.inspectTime(50, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should inspect events by 50 time units', function (done) {
    Observable.of(1, 2, 3)
      .inspectTime(50)
      .subscribe(function (x) {
        done('should not be called');
      }, null, done);
  });

  it('should inspect events multiple times', function () {
    var expected = ['1-2', '2-2'];
    Observable.concat(
      Observable.timer(0, 10, rxTestScheduler).take(3).map(function (x) { return '1-' + x; }),
      Observable.timer(80, 10, rxTestScheduler).take(5).map(function (x) { return '2-' + x; })
      )
      .inspectTime(50, rxTestScheduler)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      });

    rxTestScheduler.flush();
  });

  it('should delay the source if values are not emitted often enough', function () {
    var e1 =   hot('-a--------b-----c----|');
    var subs =     '^                    !';
    var expected = '------a--------b-----|';

    expectObservable(e1.inspectTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', function () {
    var e1 =   hot('abcdefabcdefabcdefabcdefa|');
    var subs =     '^                        !';
    var expected = '-----f-----f-----f-----f-|';

    expectObservable(e1.inspectTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', function () {
    var e1 =   hot('-----|');
    var subs =     '^    !';
    var expected = '-----|';

    expectObservable(e1.inspectTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', function () {
    var e1 =   hot('-----#');
    var subs =     '^    !';
    var expected = '-----#';

    expectObservable(e1.inspectTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', function () {
    var e1 =  cold('|');
    var subs =     '(^!)';
    var expected = '|';

    expectObservable(e1.inspectTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', function () {
    var e1 =  cold('-');
    var subs =     '^';
    var expected = '-';

    expectObservable(e1.inspectTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', function () {
    var e1 =  cold('#');
    var subs =     '(^!)';
    var expected = '#';

    expectObservable(e1.inspectTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source does not complete', function () {
    var e1 =   hot('-a--(bc)-------d----------------');
    var unsub =    '                               !';
    var subs =     '^                              !';
    var expected = '------c-------------d-----------';

    expectObservable(e1.inspectTime(50, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   hot('-a--(bc)-------d----------------');
    var subs =     '^                              !';
    var expected = '------c-------------d-----------';
    var unsub =    '                               !';

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .inspectTime(50, rxTestScheduler)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should inspect values until source raises error', function () {
    var e1 =   hot('-a--(bc)-------d---------------#');
    var subs =     '^                              !';
    var expected = '------c-------------d----------#';

    expectObservable(e1.inspectTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
