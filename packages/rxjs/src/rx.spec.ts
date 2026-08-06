import { describe, expect, expectTypeOf, it } from 'vitest';
import { filter, map, rx } from './index.js';
import { map as mapSymbol } from './map.js';

describe('rx', () => {
  it('converts an ObservableInput before applying functions from left to right', () => {
    const values: number[] = [];

    const result = rx(
      [1, 2, 3, 4],
      filter((value) => value % 2 === 0),
      map((value) => value * 10)
    );
    result.subscribe((value) => values.push(value));

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expect(values).toEqual([20, 40]);
  });

  it('returns the converted Observable when no functions are supplied', () => {
    const result = rx(Promise.resolve(42));

    expect(result).toBeInstanceOf(Observable);
    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
  });

  it('coexists with the exact Symbol operator form', () => {
    const source = Observable.from([1, 2]);
    const pipeableValues: number[] = [];
    const symbolValues: number[] = [];

    rx(
      source,
      map((value) => value * 10)
    ).subscribe((value) => pipeableValues.push(value));
    source[mapSymbol]((value) => value * 100).subscribe((value) => symbolValues.push(value));

    expect(typeof map).toBe('function');
    expect(typeof mapSymbol).toBe('symbol');
    expect(pipeableValues).toEqual([10, 20]);
    expect(symbolValues).toEqual([100, 200]);
  });

  it('returns an arbitrary final function result', () => {
    const calls: string[] = [];
    const result = rx(
      [1, 2, 3],
      (source) => {
        calls.push('first');
        return source;
      },
      () => {
        calls.push('second');
        return 'ready' as const;
      }
    );

    expect(result).toBe('ready');
    expect(calls).toEqual(['first', 'second']);
    expectTypeOf(result).toEqualTypeOf<'ready'>();
  });

  it('tracks nine transformations and returns unknown beyond the overload horizon', () => {
    const increment = (value: number) => value + 1;
    const first = (source: Observable<number>) => 0;

    const nine = rx([1], first, increment, increment, increment, increment, increment, increment, increment, increment);
    const ten = rx([1], first, increment, increment, increment, increment, increment, increment, increment, increment, increment);

    expect(nine).toBe(8);
    expect(ten).toBe(9);
    expectTypeOf(nine).toEqualTypeOf<number>();
    expectTypeOf(ten).toBeUnknown();
  });
});
