import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type TimestampSymbol = typeof import('./timestamp.js').timestamp;

let timestamp: TimestampSymbol;

beforeAll(async () => {
  ({ timestamp } = await import('./timestamp.js'));
});

describe('timestamp', () => {
  it('installs an exact Symbol operator with the RxJS 7 result type', () => {
    const result = Observable.from([1])[timestamp]();
    const otherKey = Symbol('timestamp');
    type HasStringNamedTimestamp = 'timestamp' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<{ value: number; timestamp: number }>>();
    expectTypeOf<HasStringNamedTimestamp>().toEqualTypeOf<false>();
    expect('timestamp' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(timestamp)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('reads the provider once for every source value', () => {
    const times = [1, 3, 9, 12];
    const values: Array<{ value: string; timestamp: number }> = [];

    Observable.from(['a', 'b', 'c', 'd'])
      [timestamp]({ now: () => times.shift()! })
      .subscribe((value) => values.push(value));

    expect(values).toEqual([
      { value: 'a', timestamp: 1 },
      { value: 'b', timestamp: 3 },
      { value: 'c', timestamp: 9 },
      { value: 'd', timestamp: 12 },
    ]);
  });

  it('forwards provider failures through the observable error channel', () => {
    const failure = new Error('clock failed');
    const errors: unknown[] = [];

    Observable.from([1])
      [timestamp]({ now: () => {
        throw failure;
      } })
      .subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
  });
});
