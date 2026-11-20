import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { exhaustMap } from './exhaust-map.js';

describe('exhaustMap', () => {
  it('reserves concurrency before a projection reenters the source', () => {
    const outer = controllable<number>();
    const first = controllable<number>();
    const calls: Array<readonly [number, number]> = [];
    const events: Array<number | 'complete'> = [];

    outer.observable[exhaustMap]((value, index) => {
      calls.push([value, index]);
      if (value === 1) {
        outer.subscriber.next(2);
        return first.observable;
      }
      return [value];
    }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    outer.subscriber.next(1);
    expect(calls).toEqual([[1, 0]]);
    expect(events).toEqual([]);

    first.subscriber.next(1);
    first.subscriber.complete();
    outer.subscriber.next(3);
    outer.subscriber.complete();
    expect(calls).toEqual([
      [1, 0],
      [3, 1],
    ]);
    expect(events).toEqual([1, 3, 'complete']);
  });

  it('waits for the inner when the projection completes the source', () => {
    const outer = controllable<number>();
    const inner = controllable<number>();
    const events: Array<number | 'complete'> = [];

    outer.observable[exhaustMap](() => {
      outer.subscriber.complete();
      return inner.observable;
    }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    outer.subscriber.next(1);
    expect(events).toEqual([]);
    expect(inner.subscriptions).toBe(1);

    inner.subscriber.next(42);
    inner.subscriber.complete();
    expect(events).toEqual([42, 'complete']);
  });

  it('waits for the inner when input conversion completes the source', () => {
    const outer = controllable<number>();
    const events: Array<number | 'complete'> = [];
    const input = {
      get [Symbol.iterator]() {
        outer.subscriber.complete();
        return function* () {
          yield 42;
        };
      },
    };

    outer.observable[exhaustMap](() => input).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    outer.subscriber.next(1);

    expect(events).toEqual([42, 'complete']);
  });

  it.each(['projection', 'conversion'])('cancels active work when %s throws', (stage) => {
    const outer = controllable<number>();
    const inner = controllable<number>();
    const failure = new Error(stage);
    const errors: unknown[] = [];
    let completed = false;

    outer.observable[exhaustMap](
      (value) => {
        if (value === 1) {
          return inner.observable;
        }
        if (stage === 'projection') {
          throw failure;
        }
        return {
          get [Symbol.iterator](): () => Iterator<number> {
            throw failure;
          },
        };
      },
      { concurrent: 2 }
    ).subscribe({
      error: (error) => errors.push(error),
      complete: () => (completed = true),
    });
    outer.subscriber.next(1);
    outer.subscriber.next(2);

    expect(errors).toEqual([failure]);
    expect(completed).toBe(false);
    expect(outer.subscriber.active).toBe(false);
    expect(inner.subscriber.active).toBe(false);
  });

  it('ignores outer values until the active inner completes', () => {
    const outer = controllable<Observable<number>>();
    const first = controllable<number>();
    const ignored = controllable<number>();
    const last = controllable<number>();
    const results: Array<number | 'complete'> = [];

    const flattened = outer.observable[exhaustMap]((inner) => inner);
    expectTypeOf(flattened).toEqualTypeOf<Observable<number>>();
    flattened.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    outer.subscriber.next(first.observable);
    outer.subscriber.next(ignored.observable);
    first.subscriber.next(1);
    first.subscriber.complete();
    outer.subscriber.next(last.observable);
    last.subscriber.next(2);
    outer.subscriber.complete();

    expect(results).toEqual([1, 2]);
    expect(ignored.subscriptions).toBe(0);

    last.subscriber.complete();
    expect(results).toEqual([1, 2, 'complete']);
  });

  it('forwards an outer error and closes the active inner', () => {
    const failure = new Error('outer failed');
    const outer = controllable<Observable<number>>();
    const inner = controllable<number>();
    const errors: unknown[] = [];

    outer.observable[exhaustMap]((value) => value).subscribe({
      error: (error) => errors.push(error),
    });
    outer.subscriber.next(inner.observable);
    outer.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(outer.subscriber.active).toBe(false);
    expect(inner.subscriber.active).toBe(false);
  });

  it('closes the outer source and active inner when the observer aborts', () => {
    const outer = controllable<Observable<number>>();
    const inner = controllable<number>();
    const controller = new AbortController();

    outer.observable[exhaustMap]((value) => value).subscribe(null, { signal: controller.signal });
    outer.subscriber.next(inner.observable);
    controller.abort();

    expect(outer.subscriber.active).toBe(false);
    expect(inner.subscriber.active).toBe(false);
  });

  it('shares one outer and inner activation among concurrent observers', () => {
    const outer = controllable<Observable<number>>();
    const inner = controllable<number>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const flattened = outer.observable[exhaustMap]((value) => value);

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
