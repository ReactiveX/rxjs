import { describe, expect, expectTypeOf, it } from 'vitest';
import { rx } from '../rx.js';
import { filter } from './filter.js';

describe('pipeable filter', () => {
  it('emits accepted values and supplies a zero-based index', () => {
    const calls: Array<[number, number]> = [];
    const values: number[] = [];
    const source = fromValues(1, 2, 3);
    const filtered = filter((value: number, index) => {
      calls.push([value, index]);
      return value >= 2;
    })(source);

    filtered.subscribe((value) => values.push(value));

    expect(calls).toEqual([
      [1, 0],
      [2, 1],
      [3, 2],
    ]);
    expect(values).toEqual([2, 3]);
  });

  it('delivers predicate errors and cancels synchronous source work', () => {
    const failure = new Error('predicate failed');
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

    filter((value: number) => {
      if (value === 2) {
        throw failure;
      }
      return true;
    })(source).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
    expect(produced).toEqual([1, 2]);
  });

  it('preserves type-guard and Boolean narrowing through rx', () => {
    const mixed = new Observable<number | string>(() => {});
    const nullable = new Observable<0 | 1 | '' | 'value' | null | undefined>(() => {});

    const strings = rx(
      mixed,
      filter((value): value is string => typeof value === 'string')
    );
    const truthy = rx(nullable, filter(Boolean));

    expectTypeOf(strings).toEqualTypeOf<Observable<string>>();
    expectTypeOf(truthy).toEqualTypeOf<Observable<1 | 'value'>>();
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
