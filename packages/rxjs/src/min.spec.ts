import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { min } from './min.js';

describe('min', () => {
  it('selects the minimum with RxJS 7 default ascending comparison', () => {
    const numberResults: number[] = [];
    const stringResults: string[] = [];

    fromValues(42, -1, 3)[min]().subscribe((value) => numberResults.push(value));
    fromValues('delta', 'alpha', 'charlie')[min]().subscribe((value) => stringResults.push(value));

    expect(numberResults).toEqual([-1]);
    expect(stringResults).toEqual(['alpha']);
  });

  it('uses the first source value as state without comparing it to a synthetic seed', () => {
    const singleValue = { rank: 3 };
    const comparerCalls: Array<[typeof singleValue, typeof singleValue]> = [];
    const results: Array<typeof singleValue> = [];

    fromValues(singleValue)
      [min]((previous, current) => {
        comparerCalls.push([previous, current]);
        return previous.rank - current.rank;
      })
      .subscribe((value) => results.push(value));

    expect(comparerCalls).toEqual([]);
    expect(results).toEqual([singleValue]);
    expect(results[0]).toBe(singleValue);
  });

  it('uses comparer(previous, current) and selects the current value when comparison is not negative', () => {
    interface Item {
      readonly id: string;
      readonly rank: number;
    }

    const first: Item = { id: 'first', rank: 2 };
    const second: Item = { id: 'second', rank: 1 };
    const latestEqual: Item = { id: 'latest-equal', rank: 1 };
    const calls: Array<[Item, Item]> = [];
    const results: Item[] = [];

    fromValues(first, second, latestEqual)
      [min]((previous, current) => {
        calls.push([previous, current]);
        return previous.rank - current.rank;
      })
      .subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [first, second],
      [second, latestEqual],
    ]);
    expect(results).toEqual([latestEqual]);
    expect(results[0]).toBe(latestEqual);
  });

  it('completes without emitting for an empty source', () => {
    const observations: string[] = [];
    const source = new Observable<number>((subscriber) => subscriber.complete());

    source[min]().subscribe({
      next: () => observations.push('next'),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual(['complete']);
  });

  it('forwards source errors without emitting a minimum', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[min]().subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
  });

  it('forwards comparer errors and immediately aborts synchronous source work', () => {
    const failure = new Error('comparer failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    let activeSubscriber: Subscriber<number> | undefined;
    let sourceActiveWhenErrored: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
      for (const value of [3, 2, 1]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[min](() => {
      throw failure;
    }).subscribe({
      error: (error) => {
        sourceActiveWhenErrored = activeSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([3, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('shares comparer and source work, ref-counts cancellation, and restarts cleanly', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let comparerCalls = 0;
    let activeSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const minimum = source[min]((previous, current) => {
      comparerCalls++;
      return previous - current;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    minimum.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    minimum.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    activeSubscriber?.next(4);
    activeSubscriber?.next(2);

    expect(sourceActivations).toBe(1);
    expect(comparerCalls).toBe(1);

    firstController.abort();
    activeSubscriber?.next(3);

    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([]);
    expect(comparerCalls).toBe(2);
    expect(sourceTeardowns).toBe(0);

    secondController.abort();

    expect(activeSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    minimum.subscribe((value) => restartedResults.push(value));
    activeSubscriber?.next(5);
    activeSubscriber?.next(1);
    activeSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(comparerCalls).toBe(3);
    expect(restartedResults).toEqual([1]);
    expect(sourceTeardowns).toBe(2);
  });

  it('preserves the source type and installs only an exact unique Symbol method', () => {
    const result = new Observable<{ rank: number }>(() => {})[min]((previous, current) => previous.rank - current.rank);
    type HasStringNamedMin = 'min' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<{ rank: number }>>();
    expectTypeOf<HasStringNamedMin>().toEqualTypeOf<false>();
    expect(min.description).toBe('min');
    expect(Symbol.keyFor(min)).toBeUndefined();
    expect('min' in Observable.prototype).toBe(false);
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
