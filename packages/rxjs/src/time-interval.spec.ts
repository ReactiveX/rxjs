import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type TimeIntervalSymbol = typeof import('./time-interval.js').timeInterval;
type TimeIntervalClass = typeof import('./time-interval.js').TimeInterval;

let timeInterval: TimeIntervalSymbol;
let TimeInterval: TimeIntervalClass;

beforeAll(async () => {
  ({ timeInterval, TimeInterval } = await import('./time-interval.js'));
});

describe('timeInterval', () => {
  it('installs an exact Symbol operator and exports the legacy value class', () => {
    const result = Observable.from([1])[timeInterval]();
    const value = new TimeInterval('a', 2);
    type HasStringNamedTimeInterval = 'timeInterval' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<import('./time-interval.js').TimeInterval<number>>>();
    expectTypeOf<HasStringNamedTimeInterval>().toEqualTypeOf<false>();
    expect(value).toEqual({ value: 'a', interval: 2 });
    expect('timeInterval' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(timeInterval)).toBeUndefined();
  });

  it('measures each value from subscription or the preceding value', () => {
    const times = [0, 1, 3, 9, 12];
    const values: Array<{ value: string; interval: number }> = [];

    Observable.from(['a', 'b', 'c', 'd'])
      [timeInterval]({ now: () => times.shift()! })
      .subscribe((value) => values.push(value));

    expect(values).toEqual([
      { value: 'a', interval: 1 },
      { value: 'b', interval: 2 },
      { value: 'c', interval: 6 },
      { value: 'd', interval: 3 },
    ]);
  });

  it('does not activate the source when the initial clock read fails', () => {
    const failure = new Error('clock failed');
    let activations = 0;
    const errors: unknown[] = [];
    const source = new Observable<number>(() => {
      activations++;
    });

    source[timeInterval]({ now: () => {
      throw failure;
    } }).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
    expect(activations).toBe(0);
  });
});
