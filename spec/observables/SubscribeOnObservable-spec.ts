import { expect } from 'chai';
import * as sinon from 'sinon';
import { SubscribeOnObservable } from 'rxjs/observable/SubscribeOnObservable';
import { hot, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { TestScheduler } from 'rxjs/testing';
import { asapScheduler } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

describe('SubscribeOnObservable', () => {
  it('should create Observable to be subscribed on specified scheduler', () => {
    const e1 =   hot('--a--b--|');
    const expected = '--a--b--|';
    const sub      = '^       !';
    const subscribe = new SubscribeOnObservable(e1, 0, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should specify default scheduler if incorrect scheduler specified', () => {
    const e1 = hot('--a--b--|');
    const obj: any = sinon.spy();

    const scheduler = (<any>new SubscribeOnObservable(e1, 0, obj)).scheduler;

    expect(scheduler).to.deep.equal(asapScheduler);
  });

  it('should create observable via staic create function', () => {
    const s = new SubscribeOnObservable(null, null, rxTestScheduler);
    const r = SubscribeOnObservable.create(null, null, rxTestScheduler);

    expect(s).to.deep.equal(r);
  });

  it('should subscribe after specified delay', () => {
    const e1 =   hot('--a--b--|');
    const expected = '-----b--|';
    const sub      = '   ^    !';
    const subscribe = new SubscribeOnObservable(e1, 30, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should consider negative delay as zero', () => {
    const e1 =   hot('--a--b--|');
    const expected = '--a--b--|';
    const sub      = '^       !';
    const subscribe = new SubscribeOnObservable(e1, -10, rxTestScheduler);

    expectObservable(subscribe).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
