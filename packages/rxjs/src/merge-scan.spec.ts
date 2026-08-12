import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type MergeScanSymbol = typeof import('./merge-scan.js').mergeScan;

let mergeScan: MergeScanSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'mergeScan' in Observable.prototype;
  ({ mergeScan } = await import('./merge-scan.js'));
});

describe('mergeScan', () => {
  it('installs only its exact unique Symbol and preserves RxJS 7 inference', () => {
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];
    const otherKey = Symbol('mergeScan');
    const result = Observable.from([1, 3, 5])[mergeScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return [accumulator + value];
    }, 100);
    const iterableResult = Observable.from([1, 2])[mergeScan]((accumulator, value) => accumulator + value, '');
    const promisedResult = Observable.from([1])[mergeScan]((accumulator) => Promise.resolve(accumulator), '');

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expectTypeOf(iterableResult).toEqualTypeOf<Observable<string>>();
    expectTypeOf(promisedResult).toEqualTypeOf<Observable<string>>();

    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(hadStringMethod).toBe(false);
    expect('mergeScan' in Observable.prototype).toBe(false);
    expect(mergeScan.description).toBe('mergeScan');
    expect(Symbol.keyFor(mergeScan)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
    expect(calls).toEqual([
      [100, 1, 0],
      [101, 3, 1],
      [104, 5, 2],
    ]);
    expect(events).toEqual([101, 104, 109, 'complete']);
  });

  it('honors concurrency, queues source values, and completes after every active and queued inner', () => {
    const source = controllable<number>();
    const first = controllable<number>();
    const second = controllable<number>();
    const third = controllable<number>();
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];

    source.observable[mergeScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return [first.observable, second.observable, third.observable][value - 1]!;
    }, 0, 2).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.next(2);
    source.subscriber.next(3);

    expect(calls).toEqual([
      [0, 1, 0],
      [0, 2, 1],
    ]);
    expect(third.active).toBe(false);

    first.subscriber.next(10);
    second.subscriber.next(20);
    first.subscriber.complete();

    expect(calls).toEqual([
      [0, 1, 0],
      [0, 2, 1],
      [20, 3, 2],
    ]);
    expect(third.active).toBe(true);

    source.subscriber.complete();
    second.subscriber.complete();
    expect(events).toEqual([10, 20]);

    third.subscriber.next(30);
    third.subscriber.complete();
    expect(events).toEqual([10, 20, 30, 'complete']);
  });

  it('starts a reentrant projection immediately when concurrency is available', () => {
    const source = controllable<number>();
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];

    source.observable[mergeScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      if (value === 2) {
        return [20];
      }
      if (value === 3) {
        return [30];
      }
      return new Observable<number>((subscriber) => {
        subscriber.next(10);
        subscriber.next(11);
        subscriber.complete();
      });
    }, 0).subscribe({
      next: (value) => {
        events.push(value);
        if (value === 10) {
          source.subscriber.next(2);
        }
      },
      complete: () => events.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.next(3);
    source.subscriber.complete();

    expect(calls).toEqual([
      [0, 1, 0],
      [10, 2, 1],
      [11, 3, 2],
    ]);
    expect(events).toEqual([10, 20, 11, 30, 'complete']);
  });

  it('drains a large synchronous queue iteratively at concurrency one', () => {
    const count = 20_000;
    const gate = controllable<number>();
    let seen = 0;
    let last = 0;
    let completed = false;

    Observable.from(Array.from({ length: count }, (_, index) => index + 1))
      [mergeScan]((accumulator, value) => (value === 1 ? gate.observable : [accumulator + value]), 0, 1)
      .subscribe({
        next: (value) => {
          seen++;
          last = value;
        },
        complete: () => {
          completed = true;
        },
      });

    expect(seen).toBe(0);
    expect(completed).toBe(false);

    gate.subscriber.next(1);
    gate.subscriber.complete();

    expect(seen).toBe(count);
    expect(last).toBe((count * (count + 1)) / 2);
    expect(completed).toBe(true);
  });

  it('forwards projection, conversion, inner, and source errors while cancelling all active work', () => {
    const projectionFailure = new Error('projection failed');
    const conversionFailure = new TypeError('conversion failed');
    const innerFailure = new Error('inner failed');
    const sourceFailure = new Error('source failed');

    const projectionSource = controllable<number>();
    const projectionErrors: unknown[] = [];
    projectionSource.observable[mergeScan](() => {
      throw projectionFailure;
    }, 0).subscribe({ error: (error) => projectionErrors.push(error) });
    projectionSource.subscriber.next(1);

    const conversionSource = controllable<number>();
    const conversionErrors: unknown[] = [];
    conversionSource.observable[mergeScan](
      () =>
        ({
          [Symbol.iterator](): Iterator<number> {
            throw conversionFailure;
          },
        }) satisfies Iterable<number>,
      0
    ).subscribe({ error: (error) => conversionErrors.push(error) });
    conversionSource.subscriber.next(1);

    const innerSource = controllable<number>();
    const failingInner = controllable<number>();
    const siblingInner = controllable<number>();
    const innerErrors: unknown[] = [];
    innerSource.observable[mergeScan]((_accumulator, value) => (value === 1 ? failingInner.observable : siblingInner.observable), 0).subscribe({
      error: (error) => innerErrors.push(error),
    });
    innerSource.subscriber.next(1);
    innerSource.subscriber.next(2);
    failingInner.subscriber.error(innerFailure);

    const outerSource = controllable<number>();
    const activeInner = controllable<number>();
    const sourceErrors: unknown[] = [];
    outerSource.observable[mergeScan](() => activeInner.observable, 0).subscribe({
      error: (error) => sourceErrors.push(error),
    });
    outerSource.subscriber.next(1);
    outerSource.subscriber.error(sourceFailure);

    expect(projectionErrors).toEqual([projectionFailure]);
    expect(conversionErrors).toEqual([conversionFailure]);
    expect(innerErrors).toEqual([innerFailure]);
    expect(sourceErrors).toEqual([sourceFailure]);
    expect(projectionSource.subscriber.active).toBe(false);
    expect(conversionSource.subscriber.active).toBe(false);
    expect(innerSource.subscriber.active).toBe(false);
    expect(siblingInner.subscriber.active).toBe(false);
    expect(outerSource.subscriber.active).toBe(false);
    expect(activeInner.subscriber.active).toBe(false);
  });

  it('keeps nonpositive concurrency queued until cancellation', () => {
    const source = controllable<number>();
    const controller = new AbortController();
    const calls: number[] = [];
    let completed = false;

    source.observable[mergeScan]((_accumulator, value) => {
      calls.push(value);
      return [value];
    }, 0, 0).subscribe(
      { complete: () => (completed = true) },
      { signal: controller.signal }
    );

    source.subscriber.next(1);
    source.subscriber.complete();

    expect(calls).toEqual([]);
    expect(completed).toBe(false);
    controller.abort();
    expect(source.subscriber.active).toBe(false);
  });

  it('shares and ref-counts one activation, discards its queue, and restarts with fresh state', () => {
    const source = tracked<number>();
    const inner = tracked<number>();
    const calls: Array<readonly [number, number, number]> = [];
    const result = source.observable[mergeScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return inner.observable;
    }, 0, 1);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    source.subscribers[0]?.next(1);
    source.subscribers[0]?.next(2);
    expect(inner.activations).toBe(1);
    expect(calls).toEqual([[0, 1, 0]]);
    inner.subscribers[0]?.next(5);
    expect(firstValues).toEqual([5]);
    expect(secondValues).toEqual([5]);

    firstController.abort();
    expect(source.subscribers[0]?.active).toBe(true);
    expect(inner.subscribers[0]?.active).toBe(true);

    secondController.abort();
    expect(source.subscribers[0]?.active).toBe(false);
    expect(inner.subscribers[0]?.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(inner.teardowns).toBe(1);
    expect(calls).toEqual([[0, 1, 0]]);

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    source.subscribers[1]?.next(3);
    expect(inner.activations).toBe(2);
    inner.subscribers[1]?.next(7);

    expect(calls.at(-1)).toEqual([0, 3, 0]);
    expect(restartedValues).toEqual([7]);

    restartController.abort();
    expect(source.subscribers[1]?.active).toBe(false);
    expect(inner.subscribers[1]?.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly active: boolean;
} {
  let subscriber: Subscriber<T> | undefined;
  const observable = new Observable<T>((nextSubscriber) => {
    subscriber = nextSubscriber;
  });

  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('The controllable Observable has not activated.');
      }
      return subscriber;
    },
    get active() {
      return subscriber?.active ?? false;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
  readonly teardowns: number;
} {
  const subscribers: Subscriber<T>[] = [];
  let activations = 0;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    activations++;
    subscribers.push(subscriber);
    subscriber.addTeardown(() => teardowns++);
  });

  return {
    observable,
    subscribers,
    get activations() {
      return activations;
    },
    get teardowns() {
      return teardowns;
    },
  };
}
