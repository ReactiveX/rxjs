import { describe, expect, expectTypeOf, it } from 'vitest';
import { take as takeSymbol } from '../take.js';
import { take } from './take.js';

describe('pipeable take', () => {
  it('emits the requested values and cancels synchronous source work', () => {
    const produced: number[] = [];
    const values: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3, 4]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    const firstTwo = take<number>(2)(source);
    expectTypeOf(firstTwo).toEqualTypeOf<Observable<number>>();
    firstTwo.subscribe({
      next: (value) => values.push(value),
      complete: () => values.push('complete'),
    });

    expect(values).toEqual([1, 2, 'complete']);
    expect(produced).toEqual([1, 2]);
  });

  it.each([0, -1])('completes without activating the source for a count of %i', (count) => {
    let activations = 0;
    const values: string[] = [];
    const source = new Observable<number>(() => activations++);

    take<number>(count)(source).subscribe({ complete: () => values.push('complete') });

    expect(activations).toBe(0);
    expect(values).toEqual(['complete']);
  });

  it('keeps the pipeable and exact-Symbol forms behaviorally aligned', () => {
    const pipeableValues: number[] = [];
    const symbolValues: number[] = [];

    take<number>(2)(Observable.from([1, 2, 3])).subscribe((value) => pipeableValues.push(value));
    Observable.from([1, 2, 3])
      [takeSymbol](2)
      .subscribe((value) => symbolValues.push(value));

    expect(pipeableValues).toEqual([1, 2]);
    expect(symbolValues).toEqual(pipeableValues);
  });
});
