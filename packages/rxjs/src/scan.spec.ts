import { describe, it, expect, expectTypeOf } from 'vitest';
import '@rxjs/observable-polyfill';
import { scan } from './scan.js';

describe('scan', () => {
  it('should accumulate values from a seed with indices starting at zero', () => {
    const results: (string | number)[] = [];
    const accumulatorCalls: Array<[number, number, number]> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const scanned = source[scan]((accumulator, value, index) => {
      accumulatorCalls.push([accumulator, value, index]);
      return accumulator + value;
    }, 0);
    expectTypeOf(scanned).toEqualTypeOf<Observable<number>>();

    scanned.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 3, 6, 'complete']);
    expect(accumulatorCalls).toEqual([
      [0, 1, 0],
      [1, 2, 1],
      [3, 3, 2],
    ]);
  });

  it('should emit the first value unchanged when no seed is provided', () => {
    const results: (string | number)[] = [];
    const accumulatorCalls: Array<[number, number, number]> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    const scanned = source[scan]((accumulator, value, index) => {
      accumulatorCalls.push([accumulator, value, index]);
      return accumulator + value;
    });
    expectTypeOf(scanned).toEqualTypeOf<Observable<number>>();

    scanned.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 3, 6, 'complete']);
    expect(accumulatorCalls).toEqual([
      [1, 2, 1],
      [3, 3, 2],
    ]);
  });

  it('should treat an explicit undefined as a seed', () => {
    const results: string[] = [];
    const source = new Observable<string>((subscriber) => {
      subscriber.next('a');
      subscriber.next('b');
      subscriber.complete();
    });

    const scanned = source[scan]<string, undefined>(
      (accumulator: string | undefined, value, index) => `${accumulator ?? 'undefined'}:${value}:${index}`,
      undefined
    );
    expectTypeOf(scanned).toEqualTypeOf<Observable<string>>();

    scanned.subscribe({
      next: (value) => results.push(value),
    });

    expect(results).toEqual(['undefined:a:0', 'undefined:a:0:b:1']);
  });
});
