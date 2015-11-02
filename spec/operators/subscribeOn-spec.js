/* globals describe, it, expect, hot, expectObservable, expectSubscriptions, rxTestScheduler*/
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.subscribeOn()', function () {
  it('should subscribe on specified scheduler', function () {
    var e1 =   hot('--a--b--|');
    var expected = '--a--b--|';
    var sub =      '^       !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should start subscribe after specified delay', function () {
    var e1 =   hot('--a--b--|');
    var expected = '-----b--|';
    var sub =      '   ^    !';

    expectObservable(e1.subscribeOn(rxTestScheduler, 30)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source raises error', function () {
    var e1 =   hot('--a--#');
    var expected = '--a--#';
    var sub =      '^    !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source is empty', function () {
    var e1 =   hot('----|');
    var expected = '----|';
    var sub =      '^   !';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source does not complete', function () {
    var e1 =   hot('----');
    var expected = '----';
    var sub =      '^   ';

    expectObservable(e1.subscribeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
