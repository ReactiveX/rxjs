import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { filter } from './filter.js';

describe('filter', () => {
  it('emits accepted values and supplies a zero-based index', () => {
    const minimum = 2;
    const calls: Array<[number, number]> = [];
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    source[filter]((value, index) => {
      calls.push([value, index]);
      return value >= minimum;
    }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(calls).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
    expect(results).toEqual([2, 3, 'complete']);
  });

  it('forwards source errors', () => {
    const failure = new Error('source failed');
    const results: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[filter](() => true).subscribe({
      next: (value) => results.push(value),
      error: (error) => results.push(error),
    });

    expect(results).toEqual([1, failure]);
  });

  it('errors and closes synchronous source work when the predicate throws', () => {
    const failure = new Error('predicate failed');
    const produced: number[] = [];
    const results: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[filter]((value) => {
      if (value === 2) {
        throw failure;
      }
      return true;
    }).subscribe({
      next: (value) => results.push(value),
      error: (error) => results.push(error),
    });

    expect(produced).toEqual([1, 2]);
    expect(results).toEqual([1, failure]);
  });

  it('shares predicate work and ref-counts the active source', () => {
    let activations = 0;
    let teardowns = 0;
    let activeSubscriber: Subscriber<number> | undefined;
    const predicateCalls: number[] = [];
    const source = new Observable<number>((subscriber) => {
      activations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => {
        teardowns++;
      });
    });
    const filtered = source[filter]((value) => {
      predicateCalls.push(value);
      return value % 2 === 1;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    filtered.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    filtered.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    activeSubscriber?.next(1);
    activeSubscriber?.next(2);

    expect(activations).toBe(1);
    expect(predicateCalls).toEqual([1, 2]);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    firstController.abort();
    expect(teardowns).toBe(0);

    activeSubscriber?.next(3);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1, 3]);

    secondController.abort();
    expect(teardowns).toBe(1);
  });

  it('preserves the platform string-named filter method as a separate contract', () => {
    const platformFilter = Observable.prototype.filter;
    const platformDescriptor = Object.getOwnPropertyDescriptor(Observable.prototype, 'filter');
    const source = new Observable<number>(() => {});

    expect(filter).not.toBe('filter');
    expect(source[filter]).not.toBe(platformFilter);
    expect(Observable.prototype.filter).toBe(platformFilter);
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, 'filter')).toEqual(platformDescriptor);
  });

  it('preserves type-guard and Boolean predicate narrowing', () => {
    const mixed = new Observable<number | string>(() => {});
    const nullable = new Observable<0 | 1 | '' | 'value' | null | undefined>(() => {});

    const strings = mixed[filter]((value): value is string => typeof value === 'string');
    const truthy = nullable[filter](Boolean);

    expectTypeOf(strings).toEqualTypeOf<Observable<string>>();
    expectTypeOf(truthy).toEqualTypeOf<Observable<1 | 'value'>>();
  });
});
