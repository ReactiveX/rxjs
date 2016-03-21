"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var SubscribeOnObservable_1 = require('../../dist/cjs/observable/SubscribeOnObservable');
describe('SubscribeOnObservable', function () {
    it('should create Observable to be subscribed on specified scheduler', function () {
        var e1 = hot('--a--b--|');
        var expected = '--a--b--|';
        var sub = '^       !';
        var subscribe = new SubscribeOnObservable_1.SubscribeOnObservable(e1, 0, rxTestScheduler);
        expectObservable(subscribe).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should specify default scheduler if incorrect scheduler specified', function () {
        var e1 = hot('--a--b--|');
        var obj = jasmine.createSpy('dummy');
        var scheduler = (new SubscribeOnObservable_1.SubscribeOnObservable(e1, 0, obj)).scheduler;
        expect(scheduler).toBe(Rx.Scheduler.asap);
    });
    it('should create observable via staic create function', function () {
        var s = new SubscribeOnObservable_1.SubscribeOnObservable(null, null, rxTestScheduler);
        var r = SubscribeOnObservable_1.SubscribeOnObservable.create(null, null, rxTestScheduler);
        expect(s).toEqual(r);
    });
    it('should subscribe after specified delay', function () {
        var e1 = hot('--a--b--|');
        var expected = '-----b--|';
        var sub = '   ^    !';
        var subscribe = new SubscribeOnObservable_1.SubscribeOnObservable(e1, 30, rxTestScheduler);
        expectObservable(subscribe).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should consider negative delay as zero', function () {
        var e1 = hot('--a--b--|');
        var expected = '--a--b--|';
        var sub = '^       !';
        var subscribe = new SubscribeOnObservable_1.SubscribeOnObservable(e1, -10, rxTestScheduler);
        expectObservable(subscribe).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
});
//# sourceMappingURL=SubscribeOnObservable-spec.js.map