/* globals describe, it, expect, hot, expectObservable, expectSubscriptions, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var SubscribeOnObservable = require('../../dist/cjs/observables/SubscribeOnObservable');
var Observable = Rx.Observable;

describe('SubscribeOnObservable', function () {
  it('should create Observable to be subscribed on specified scheduler', function () {
    var e1 =   hot('--a--b--|');
    var expected = '--a--b--|';
    var sub      = '^       !';
    var subscribe = new SubscribeOnObservable(e1, 0, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should specify default scheduler if incorrect scheduler specified', function () {
    var e1 = hot('--a--b--|');
    var scheduler = new SubscribeOnObservable(e1, 0, jasmine.createSpy('dummy')).scheduler;

    expect(scheduler).toBe(Rx.Scheduler.nextTick);
  });

  it('should create observable via staic create function', function () {
    var s = new SubscribeOnObservable(rxTestScheduler);
    var r = SubscribeOnObservable.create(rxTestScheduler);

    expect(s).toEqual(r);
  });

  it('should subscribe after specified delay', function () {
    var e1 =   hot('--a--b--|');
    var expected = '-----b--|';
    var sub      = '   ^    !';
    var subscribe = new SubscribeOnObservable(e1, 30, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should consider negative delay as zero', function () {
    var e1 =   hot('--a--b--|');
    var expected = '--a--b--|';
    var sub      = '^       !';
    var subscribe = new SubscribeOnObservable(e1, -10, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
