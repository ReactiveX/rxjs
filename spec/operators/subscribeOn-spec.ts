import { expect } from 'chai';
import { hot, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { subscribeOn, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable, queueScheduler } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

/** @test {subscribeOn} */
describe('subscribeOn operator', () => {
  it('should subscribe on specified scheduler', () => {
    const e1 =   hot('--a--b--|');
    const expected = '--a--b--|';
    const sub =      '^       !';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should start subscribe after specified delay', () => {
    const e1 =   hot('--a--b--|');
    const expected = '-----b--|';
    const sub =      '   ^    !';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler, 30))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source raises error', () => {
    const e1 =   hot('--a--#');
    const expected = '--a--#';
    const sub =      '^    !';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source is empty', () => {
    const e1 =   hot('----|');
    const expected = '----|';
    const sub =      '^   !';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should subscribe when source does not complete', () => {
    const e1 =   hot('----');
    const expected = '----';
    const sub =      '^   ';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.pipe(subscribeOn(rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should not break unsubscription chains when the result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      subscribeOn(rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should properly support a delayTime of Infinity', () => {
    const e1 =   hot('--a--b--|');
    const expected = '---------';

    expectObservable(e1.pipe(subscribeOn(rxTestScheduler, Infinity))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe([]);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      subscribeOn(queueScheduler),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
