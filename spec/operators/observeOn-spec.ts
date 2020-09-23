import { observeOn, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { expect } from 'chai';
import { hot, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, Observable, asapScheduler, queueScheduler } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

/** @test {observeOn} */
describe('observeOn operator', () => {
  it('should observe on specified scheduler', () => {
    const e1 =    hot('--a--b--|');
    const expected =  '--a--b--|';
    const sub =       '^       !';

    expectObservable(e1.pipe(observeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe after specified delay', () => {
    const e1 =    hot('--a--b--|   ');
    const expected =  '-----a--b--|';
    const sub =       '^       !   ';

    expectObservable(e1.pipe(observeOn(rxTestScheduler, 30))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source raises error', () => {
    const e1 =    hot('--a--#');
    const expected =  '--a--#';
    const sub =       '^    !';

    expectObservable(e1.pipe(observeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source is empty', () => {
    const e1 =    hot('-----|');
    const expected =  '-----|';
    const sub =       '^    !';

    expectObservable(e1.pipe(observeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should observe when source does not complete', () => {
    const e1 =    hot('-----');
    const expected =  '-----';
    const sub =       '^    ';

    expectObservable(e1.pipe(observeOn(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =    hot('--a--b--|');
    const sub =       '^   !    ';
    const expected =  '--a--    ';
    const unsub =     '    !    ';

    const result = e1.pipe(observeOn(rxTestScheduler));

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
      observeOn(rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
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
      observeOn(queueScheduler),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
