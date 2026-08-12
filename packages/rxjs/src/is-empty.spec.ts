import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { isEmpty } from './is-empty.js';

describe('isEmpty', () => {
  it('emits true only when the source completes without a value', () => {
    const emptyObservations: Array<boolean | 'complete'> = [];
    const nonemptyObservations: Array<boolean | 'complete'> = [];

    new Observable<number>((subscriber) => subscriber.complete())[isEmpty]().subscribe({
      next: (value) => emptyObservations.push(value),
      complete: () => emptyObservations.push('complete'),
    });
    Observable.from([1, 2, 3])[isEmpty]().subscribe({
      next: (value) => nonemptyObservations.push(value),
      complete: () => nonemptyObservations.push('complete'),
    });

    expect(emptyObservations).toEqual([true, 'complete']);
    expect(nonemptyObservations).toEqual([false, 'complete']);
  });

  it('cancels synchronous source work before notifying downstream of the first value', () => {
    const produced: number[] = [];
    const observations: Array<boolean | 'complete'> = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActiveWhenObserved: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[isEmpty]().subscribe({
      next: (value) => {
        sourceActiveWhenObserved = sourceSubscriber?.active;
        sourceSubscriber?.next(99);
        observations.push(value);
      },
      complete: () => observations.push('complete'),
    });

    expect(produced).toEqual([1]);
    expect(sourceActiveWhenObserved).toBe(false);
    expect(observations).toEqual([false, 'complete']);
  });

  it('forwards a source error without emitting a boolean', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];

    new Observable<number>((subscriber) => subscriber.error(failure))[isEmpty]().subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
  });

  it('shares source work, ref-counts cancellation, and restarts after the last observer leaves', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const tested = source[isEmpty]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: boolean[] = [];
    const secondValues: boolean[] = [];

    tested.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    tested.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(sourceActivations).toBe(1);

    firstController.abort();
    expect(sourceSubscribers[0]?.active).toBe(true);
    expect(sourceTeardowns).toBe(0);

    sourceSubscribers[0]?.next(1);

    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([false]);
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    tested.subscribe((value) => firstValues.push(value));
    expect(sourceActivations).toBe(2);

    sourceSubscribers[1]?.complete();

    expect(firstValues).toEqual([true]);
    expect(sourceTeardowns).toBe(2);
  });

  it('exports an exact unique Symbol, adds no string method, and returns Observable<boolean>', () => {
    const result = Observable.from([1, 2, 3])[isEmpty]();
    const unrelatedKey = Symbol('isEmpty');
    type HasStringNamedIsEmpty = 'isEmpty' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<boolean>>();
    expectTypeOf<HasStringNamedIsEmpty>().toEqualTypeOf<false>();
    expect(isEmpty.description).toBe('isEmpty');
    expect(Symbol.keyFor(isEmpty)).toBeUndefined();
    expect('isEmpty' in Observable.prototype).toBe(false);
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[unrelatedKey]).toBeUndefined();
  });
});
