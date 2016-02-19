import * as Rx from '../../dist/cjs/Rx.KitchenSink';
import {hot, cold, expectObservable, expectSubscriptions} from '../helpers/marble-testing';
import {it, asDiagram} from '../helpers/test-helper';

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

describe('Observable.prototype.observeOn()', () => {
  asDiagram('observeOn(scheduler)')('should observe on specified scheduler', () => {
    const e1 =    hot('--a--b--|');
    const expected =  '--a--b--|';
    const sub =       '^       !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe after specified delay', () => {
    const e1 =    hot('--a--b--|');
    const expected =  '-----a--b--|';
    const sub =       '^          !';

    expectObservable(e1.observeOn(rxTestScheduler, 30)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source raises error', () => {
    const e1 =    hot('--a--#');
    const expected =  '--a--#';
    const sub =       '^    !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source is empty', () => {
    const e1 =    hot('-----|');
    const expected =  '-----|';
    const sub =       '^    !';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source does not complete', () => {
    const e1 =    hot('-----');
    const expected =  '-----';
    const sub =       '^    ';

    expectObservable(e1.observeOn(rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.observeOn(rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .observeOn(rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x))

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });
});
