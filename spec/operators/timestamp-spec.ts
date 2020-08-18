import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { timestamp, map, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, Observable } from 'rxjs';

declare const rxTestScheduler: TestScheduler;

/** @test {timestamp} */
describe('timestamp operator', () => {
  it('should record the time stamp per each source elements', () => {
    const e1 =   hot('-b-c-----d--e--|');
    const e1subs =   '^              !';
    const expected = '-w-x-----y--z--|';
    const expectedValue = { w: 10, x: 30, y: 90, z: 120 };

    const result = e1.pipe(
      timestamp(rxTestScheduler),
      map(x => x.timestamp)
    );

    expectObservable(result).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp if source emit elements', () => {
    const e1 = hot('--a--^b--c----d---e--|');
    const e1subs =      '^               !';
    const expected =    '-w--x----y---z--|';

    const expectedValue = {
      w: { value: 'b', timestamp: 10 },
      x: { value: 'c', timestamp: 40 },
      y: { value: 'd', timestamp: 90 },
      z: { value: 'e', timestamp: 130 }
    };

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes without record stamp if source does not emits', () => {
    const e1 =   hot('---------|');
    const e1subs =   '^        !';
    const expected = '---------|';

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp then does not completes if source emits but not completes', () => {
    const e1 =   hot('-a--b--');
    const e1subs =   '^      ';
    const expected = '-y--z--';

    const expectedValue = {
      y: { value: 'a', timestamp: 10 },
      z: { value: 'b', timestamp: 40 }
    };

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const unsub =    '       !           ';
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';

    const expectedValue = {
      y: { value: 'a', timestamp: 10 },
      z: { value: 'b', timestamp: 40 }
    };

    const result = e1.pipe(timestamp(rxTestScheduler));

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--b-----c---d---|');
    const e1subs =   '^      !           ';
    const expected = '-y--z---           ';
    const unsub =    '       !           ';

    const expectedValue = {
      y: { value: 'a', timestamp: 10 },
      z: { value: 'b', timestamp: 40 }
    };

    const result = e1.pipe(
      mergeMap(x => of(x)),
      timestamp(rxTestScheduler),
      mergeMap(x => of(x))
    );

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('raise error if source raises error', () => {
    const e1 =   hot('---#');
    const e1subs =   '^  !';
    const expected = '---#';

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should record stamp then raise error if source raises error after emit', () => {
    const e1 =   hot('-a--b--#');
    const e1subs =   '^      !';
    const expected = '-y--z--#';

    const expectedValue = {
      y: { value: 'a', timestamp: 10 },
      z: { value: 'b', timestamp: 40 }
    };

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source immediately throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(timestamp(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
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
      timestamp(),
      take(3),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
