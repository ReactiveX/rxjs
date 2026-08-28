import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { takeLast } from './take-last.js';

describe('takeLast', () => {
  it.each([0, -42])('completes without subscribing to the source for a count of %s', (amount) => {
    let subscriptions = 0;
    const results: string[] = [];
    const source = new Observable<string>((subscriber) => {
      subscriptions++;
      subscriber.next('value');
      subscriber.complete();
    });

    const taken = source[takeLast](amount);
    expectTypeOf(taken).toEqualTypeOf<Observable<string>>();

    taken.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['complete']);
    expect(subscriptions).toBe(0);
  });

  it('buffers every value for Infinity and emits them on completion', () => {
    const events: Array<number | 'complete'> = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      expect(events).toEqual([]);
      subscriber.complete();
    });

    source[takeLast](Infinity).subscribe({
      next: (value) => events.push(value),
      error: (error) => errors.push(error),
      complete: () => events.push('complete'),
    });

    expect(errors).toEqual([]);
    expect(events).toEqual([1, 2, 3, 'complete']);
  });

  it('exposes the extension through the exported Symbol only', () => {
    const source = new Observable<number>(() => {});
    type HasStringNamedTakeLast = Observable<number> extends { takeLast: unknown } ? true : false;

    expectTypeOf<HasStringNamedTakeLast>().toEqualTypeOf<false>();
    expect(source[takeLast]).toBeTypeOf('function');
    expect('takeLast' in source).toBe(false);
  });
});
