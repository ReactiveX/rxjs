import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { mergeMap } from './merge-map.js';

describe('mergeMap', () => {
  it('buffers outer values at the concurrency limit and preserves output order', () => {
    const outer = controllable<number>();
    const first = controllable<string>();
    const second = controllable<string>();
    const third = controllable<string>();
    const inners = new Map([
      [1, first.observable],
      [2, second.observable],
      [3, third.observable],
    ]);
    const values: string[] = [];
    const flattened = outer.observable[mergeMap]((value) => inners.get(value)!, { concurrent: 2 });

    expectTypeOf(flattened).toEqualTypeOf<Observable<string>>();
    flattened.subscribe((value) => values.push(value));
    outer.subscriber.next(1);
    outer.subscriber.next(2);
    outer.subscriber.next(3);

    expect(first.subscriptions).toBe(1);
    expect(second.subscriptions).toBe(1);
    expect(third.subscriptions).toBe(0);

    second.subscriber.next('second');
    first.subscriber.complete();
    third.subscriber.next('third');

    expect(third.subscriptions).toBe(1);
    expect(values).toEqual(['second', 'third']);
  });

  it('shares the flattened activation until the final observer leaves', () => {
    const outer = controllable<Observable<number>>();
    const inner = controllable<number>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const flattened = outer.observable[mergeMap]((value) => value);

    flattened.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    flattened.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    outer.subscriber.next(inner.observable);
    inner.subscriber.next(1);

    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);
    expect(outer.subscriptions).toBe(1);
    expect(inner.subscriptions).toBe(1);

    firstController.abort();
    expect(outer.subscriber.active).toBe(true);
    expect(inner.subscriber.active).toBe(true);

    secondController.abort();
    expect(outer.subscriber.active).toBe(false);
    expect(inner.subscriber.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  const observable = new Observable<T>((subscriber) => {
    subscriptions++;
    sourceSubscriber = subscriber;
  });

  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('The controllable source is not active.');
      }
      return sourceSubscriber;
    },
    get subscriptions() {
      return subscriptions;
    },
  };
}
