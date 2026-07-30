import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type ReduceSymbol = typeof import('./reduce.js').reduce;

let reduce: ReduceSymbol;
let platformReduce: Observable<unknown>['reduce'];
let platformReduceDescriptor: PropertyDescriptor | undefined;

beforeAll(async () => {
  platformReduce = Observable.prototype.reduce;
  platformReduceDescriptor = Object.getOwnPropertyDescriptor(Observable.prototype, 'reduce');
  ({ reduce } = await import('./reduce.js'));
});

describe('reduce', () => {
  it('reduces values with a seed and supplies a zero-based index', () => {
    const indices: number[] = [];
    const results: Array<number | 'complete'> = [];

    fromValues(1, 2, 3)
      [reduce]((total, value, index) => {
        indices.push(index);
        return total + value;
      }, 10)
      .subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('complete'),
      });

    expect(indices).toEqual([0, 1, 2]);
    expect(results).toEqual([16, 'complete']);
  });

  it('uses the first value as state when the seed is omitted', () => {
    const calls: Array<[number, number, number]> = [];
    const results: number[] = [];

    fromValues(1, 2, 3)
      [reduce]((total, value, index) => {
        calls.push([total, value, index]);
        return total + value;
      })
      .subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [1, 2, 1],
      [3, 3, 2],
    ]);
    expect(results).toEqual([6]);
  });

  it('distinguishes an explicitly undefined seed from an omitted seed', () => {
    const calls: Array<[string | undefined, string, number]> = [];
    const results: Array<string | undefined> = [];

    fromValues('a', 'b')
      [reduce]((state: string | undefined, value, index) => {
        calls.push([state, value, index]);
        return `${state} ${value}`;
      }, undefined)
      .subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [undefined, 'a', 0],
      ['undefined a', 'b', 1],
    ]);
    expect(results).toEqual(['undefined a b']);
  });

  it('completes without a value for an empty source with no seed', () => {
    const observations: Array<unknown> = [];

    empty<number>()[reduce]((total, value) => total + value).subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual(['complete']);
  });

  it('emits the seed for an empty source, including an explicit undefined seed', () => {
    const seeded: Array<number | 'complete'> = [];
    const undefinedSeeded: Array<undefined | 'complete'> = [];

    empty<number>()[reduce]((total, value) => total + value, 42).subscribe({
      next: (value) => seeded.push(value),
      complete: () => seeded.push('complete'),
    });
    empty<number>()[reduce]((total: undefined, _value) => total, undefined).subscribe({
      next: (value) => undefinedSeeded.push(value),
      complete: () => undefinedSeeded.push('complete'),
    });

    expect(seeded).toEqual([42, 'complete']);
    expect(undefinedSeeded).toEqual([undefined, 'complete']);
  });

  it('forwards source errors without emitting accumulated state', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error(failure);
    });

    source[reduce]((total, value) => total + value, 0).subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
  });

  it('forwards accumulator errors and immediately aborts synchronous source work', () => {
    const failure = new Error('accumulator failed');
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

    source[reduce]((_total, value) => {
      if (value === 2) {
        throw failure;
      }
      return value;
    }, 0).subscribe({
      error: (error) => {
        sourceActiveWhenErrored = activeSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('shares accumulator and source work, ref-counts cancellation, and resets state on restart', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let accumulatorCalls = 0;
    let activeSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const reduced = source[reduce]((total, value) => {
      accumulatorCalls++;
      return total + value;
    }, 0);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    reduced.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    reduced.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    activeSubscriber?.next(1);
    activeSubscriber?.next(2);

    expect(sourceActivations).toBe(1);
    expect(accumulatorCalls).toBe(2);

    firstController.abort();
    activeSubscriber?.next(3);

    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([]);
    expect(accumulatorCalls).toBe(3);
    expect(sourceTeardowns).toBe(0);

    secondController.abort();

    expect(activeSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    reduced.subscribe((value) => restartedResults.push(value));
    activeSubscriber?.next(4);
    activeSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(accumulatorCalls).toBe(4);
    expect(restartedResults).toEqual([4]);
    expect(sourceTeardowns).toBe(2);
  });

  it('preserves result types and installs only an exact unique Symbol method', () => {
    const source = new Observable<number>(() => {});
    const unseeded = source[reduce]((total, value) => total + value);
    const seeded = source[reduce]((values: string[], value) => [...values, String(value)], []);

    expectTypeOf(unseeded).toEqualTypeOf<Observable<number>>();
    expectTypeOf(seeded).toEqualTypeOf<Observable<string[]>>();
    expect(reduce.description).toBe('reduce');
    expect(Symbol.keyFor(reduce)).toBeUndefined();
    expect(source[reduce]).not.toBe(platformReduce);
    expect(Observable.prototype.reduce).toBe(platformReduce);
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, 'reduce')).toEqual(platformReduceDescriptor);
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

function empty<T>(): Observable<T> {
  return new Observable<T>((subscriber) => subscriber.complete());
}
