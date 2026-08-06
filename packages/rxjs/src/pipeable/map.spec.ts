import { describe, expect, expectTypeOf, it } from 'vitest';
import { map } from './map.js';

describe('pipeable map', () => {
  it('maps values with a zero-based activation index', () => {
    const calls: Array<[number, number]> = [];
    const values: string[] = [];
    const source = fromValues(2, 4, 6);
    const mapped = map((value: number, index) => {
      calls.push([value, index]);
      return `${index}:${value * 10}`;
    })(source);

    mapped.subscribe((value) => values.push(value));

    expectTypeOf(mapped).toEqualTypeOf<Observable<string>>();
    expect(calls).toEqual([
      [2, 0],
      [4, 1],
      [6, 2],
    ]);
    expect(values).toEqual(['0:20', '1:40', '2:60']);
  });

  it('delivers projector errors and cancels synchronous source work', () => {
    const failure = new Error('projection failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    map((value: number) => {
      if (value === 2) {
        throw failure;
      }
      return value;
    })(source).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
    expect(produced).toEqual([1, 2]);
  });

  it('shares work, ref-counts cancellation, and resets its index after restart', () => {
    let activeSubscriber: Subscriber<number> | undefined;
    let activations = 0;
    let teardowns = 0;
    let projections = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const mapped = map((value: number, index) => {
      projections++;
      return `${index}:${value}`;
    })(source);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first: string[] = [];
    const second: string[] = [];

    mapped.subscribe((value) => first.push(value), { signal: firstController.signal });
    mapped.subscribe((value) => second.push(value), { signal: secondController.signal });
    activeSubscriber?.next(1);

    expect(activations).toBe(1);
    expect(projections).toBe(1);
    expect(first).toEqual(['0:1']);
    expect(second).toEqual(['0:1']);

    firstController.abort();
    activeSubscriber?.next(2);
    expect(first).toEqual(['0:1']);
    expect(second).toEqual(['0:1', '1:2']);
    expect(teardowns).toBe(0);

    secondController.abort();
    expect(teardowns).toBe(1);

    const restarted: string[] = [];
    mapped.subscribe((value) => restarted.push(value));
    activeSubscriber?.next(3);

    expect(activations).toBe(2);
    expect(restarted).toEqual(['0:3']);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}
