import { describe, expect, expectTypeOf, it } from 'vitest';
import { toArray } from './to-array.js';

describe('pipeable toArray', () => {
  it('emits one collected array and remains an Observable', () => {
    const values: number[][] = [];
    const collected = toArray<number>()(Observable.from([1, 2, 3]));

    expectTypeOf(collected).toEqualTypeOf<Observable<number[]>>();
    expect(collected).toBeInstanceOf(Observable);
    expect(collected).not.toBeInstanceOf(Promise);
    collected.subscribe((value) => values.push(value));

    expect(values).toEqual([[1, 2, 3]]);
  });

  it('forwards errors without emitting a partial array', () => {
    const failure = new Error('source failed');
    const values: number[][] = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    toArray<number>()(source).subscribe({
      next: (value) => values.push(value),
      error: (error) => errors.push(error),
    });

    expect(values).toEqual([]);
    expect(errors).toEqual([failure]);
  });

  it('discards active collection state when its last observer cancels', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const controller = new AbortController();
    const values: number[][] = [];

    toArray<number>()(source).subscribe((value) => values.push(value), { signal: controller.signal });
    sourceSubscriber?.next(1);
    controller.abort();
    sourceSubscriber?.complete();

    expect(values).toEqual([]);
    expect(teardowns).toBe(1);
  });
});
