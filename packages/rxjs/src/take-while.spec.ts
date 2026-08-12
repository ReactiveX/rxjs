import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { takeWhile } from './take-while.js';

describe('takeWhile', () => {
  it('forwards values and completion while the predicate remains truthy', () => {
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    const taken = source[takeWhile](() => true);
    expectTypeOf(taken).toEqualTypeOf<Observable<number>>();

    taken.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
  });

  it('forwards completion from an empty source', () => {
    const results: string[] = [];
    const source = new Observable<number>((subscriber) => subscriber.complete());

    source[takeWhile](() => true).subscribe({
      next: (value) => results.push(String(value)),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['complete']);
  });

  it('forwards source errors', () => {
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[takeWhile](() => true).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
  });

  it('includes the first rejected value and closes synchronous source work', () => {
    const produced: number[] = [];
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
      subscriber.complete();
    });

    source[takeWhile]((value) => value < 2, { includeLast: true }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
    expect(produced).toEqual([1, 2]);
  });

  it('preserves type-guard narrowing', () => {
    const source = new Observable<number | string>(() => {});
    const taken = source[takeWhile]((value): value is number => typeof value === 'number');

    expectTypeOf(taken).toEqualTypeOf<Observable<number>>();
  });
});
