import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import type { every as everySymbol } from './every.js';

type EverySymbol = typeof everySymbol;

let every: EverySymbol;
let platformEvery: Observable<unknown>['every'];

beforeAll(async () => {
  platformEvery = Observable.prototype.every;
  ({ every } = await import('./every.js'));
});

describe('every', () => {
  it('emits true for an empty source and when every value matches', () => {
    const emptyResults: Array<boolean | 'complete'> = [];
    const matchingResults: Array<boolean | 'complete'> = [];

    new Observable<number>((subscriber) => subscriber.complete())
      [every]((value) => value > 0)
      .subscribe({
        next: (value) => emptyResults.push(value),
        complete: () => emptyResults.push('complete'),
      });

    fromValues(2, 4, 6)
      [every]((value) => value % 2 === 0)
      .subscribe({
        next: (value) => matchingResults.push(value),
        complete: () => matchingResults.push('complete'),
      });

    expect(emptyResults).toEqual([true, 'complete']);
    expect(matchingResults).toEqual([true, 'complete']);
  });

  it('passes the value, zero-based index, and source to the predicate', () => {
    const maximum = 10;
    const source = fromValues(2, 4, 6);
    const calls: Array<[number, number, Observable<number>]> = [];
    const results: boolean[] = [];

    source[every]((value, index, predicateSource) => {
      calls.push([value, index, predicateSource]);
      return value < maximum;
    }).subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [2, 0, source],
      [4, 1, source],
      [6, 2, source],
    ]);
    expect(results).toEqual([true]);
  });

  it('aborts synchronous source work before emitting and completing on the first false result', () => {
    const produced: number[] = [];
    const predicateCalls: number[] = [];
    const observations: Array<boolean | 'complete'> = [];
    let sourceActiveWhenObserved: boolean | undefined;
    let activeSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[every]((value) => {
      predicateCalls.push(value);
      return value < 2;
    }).subscribe({
      next: (value) => {
        sourceActiveWhenObserved = activeSubscriber?.active;
        activeSubscriber?.next(99);
        observations.push(value);
      },
      complete: () => observations.push('complete'),
    });

    expect(produced).toEqual([1, 2]);
    expect(predicateCalls).toEqual([1, 2]);
    expect(sourceActiveWhenObserved).toBe(false);
    expect(observations).toEqual([false, 'complete']);
  });

  it('aborts source work before forwarding predicate errors', () => {
    const failure = new Error('predicate failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    let activeSubscriber: Subscriber<number> | undefined;
    let sourceActiveWhenErrored: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[every]((value) => {
      if (value === 2) {
        throw failure;
      }
      return true;
    }).subscribe({
      error: (error) => {
        sourceActiveWhenErrored = activeSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('forwards source errors without emitting a boolean', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[every](() => true).subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
  });

  it('shares predicate and source work, ref-counts cancellation, and restarts cleanly', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let predicateCalls = 0;
    let activeSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const tested = source[every]((value, index) => {
      predicateCalls++;
      return value > index;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: boolean[] = [];
    const secondValues: boolean[] = [];

    tested.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    tested.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    activeSubscriber?.next(1);

    expect(sourceActivations).toBe(1);
    expect(predicateCalls).toBe(1);

    firstController.abort();
    activeSubscriber?.next(2);

    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([]);
    expect(predicateCalls).toBe(2);
    expect(sourceTeardowns).toBe(0);

    secondController.abort();

    expect(activeSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedValues: boolean[] = [];
    tested.subscribe((value) => restartedValues.push(value));
    activeSubscriber?.next(1);
    activeSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(predicateCalls).toBe(3);
    expect(restartedValues).toEqual([true]);
    expect(sourceTeardowns).toBe(2);
  });

  it('exports an exact unique Symbol, returns Observable<boolean>, and preserves the platform every method', () => {
    const result = fromValues(1, 2)[every](Boolean);
    const allFalsy = new Observable<0 | '' | null>(() => {})[every](Boolean);
    type HasStringNamedEvery = 'every' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<boolean>>();
    expectTypeOf(allFalsy).toEqualTypeOf<Observable<false>>();
    expectTypeOf<HasStringNamedEvery>().toEqualTypeOf<true>();
    expect(every.description).toBe('every');
    expect(Symbol.keyFor(every)).toBeUndefined();
    expect(Observable.prototype.every).toBe(platformEvery);
    expect(Observable.prototype[every]).not.toBe(platformEvery);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        break;
      }
      subscriber.next(value);
    }
    subscriber.complete();
  });
}
