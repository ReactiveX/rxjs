import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type SwitchScanSymbol = typeof import('./switch-scan.js').switchScan;

let switchScan: SwitchScanSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'switchScan' in Observable.prototype;
  ({ switchScan } = await import('./switch-scan.js'));
});

describe('switchScan', () => {
  it('installs only its exact unique Symbol and preserves RxJS 7 inference', () => {
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];
    const otherKey = Symbol('switchScan');
    const result = Observable.from([1, 3, 5])[switchScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return [accumulator + value];
    }, 100);
    const differentSeed = Observable.from([1])[switchScan]((_accumulator: string, value) => [value], '');
    const unionResult = Observable.from([true])[switchScan](
      (_accumulator, value) => (value ? Observable.from([123]) : Observable.from(['value'])),
      null
    );

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expectTypeOf(differentSeed).toEqualTypeOf<Observable<number>>();
    expectTypeOf(unionResult).toEqualTypeOf<Observable<string | number>>();

    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(hadStringMethod).toBe(false);
    expect('switchScan' in Observable.prototype).toBe(false);
    expect(switchScan.description).toBe('switchScan');
    expect(Symbol.keyFor(switchScan)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
    expect(calls).toEqual([
      [100, 1, 0],
      [101, 3, 1],
      [104, 5, 2],
    ]);
    expect(events).toEqual([101, 104, 109, 'complete']);
  });

  it('carries the latest inner value as state, switches inners, and waits for the active inner', () => {
    const source = controllable<number>();
    const first = controllable<number>();
    const second = controllable<number>();
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];

    source.observable[switchScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return value === 1 ? first.observable : second.observable;
    }, 10).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    source.subscriber.next(1);
    first.subscriber.next(11);
    source.subscriber.next(2);

    expect(first.subscriber.active).toBe(false);
    expect(calls).toEqual([
      [10, 1, 0],
      [11, 2, 1],
    ]);

    source.subscriber.complete();
    expect(events).toEqual([11]);
    expect(second.subscriber.active).toBe(true);

    second.subscriber.next(13);
    second.subscriber.complete();
    expect(events).toEqual([11, 13, 'complete']);
  });

  it('cancels a synchronous inner before a reentrant switch can observe another value', () => {
    const source = controllable<number>();
    const produced: number[] = [];
    const calls: Array<readonly [number, number, number]> = [];
    const events: Array<number | 'complete'> = [];

    const result = source.observable[switchScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      if (value === 2) {
        return [20];
      }
      return new Observable<number>((subscriber) => {
        produced.push(10);
        subscriber.next(10);
        if (subscriber.active) {
          produced.push(11);
          subscriber.next(11);
        }
        subscriber.complete();
      });
    }, 0);

    result.subscribe({
      next: (value) => {
        events.push(value);
        if (value === 10) {
          source.subscriber.next(2);
        }
      },
      complete: () => events.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.complete();

    expect(calls).toEqual([
      [0, 1, 0],
      [10, 2, 1],
    ]);
    expect(produced).toEqual([10]);
    expect(events).toEqual([10, 20, 'complete']);
  });

  it('forwards projection, conversion, inner, and source errors while cancelling active work', () => {
    const projectionFailure = new Error('projection failed');
    const conversionFailure = new TypeError('conversion failed');
    const innerFailure = new Error('inner failed');
    const sourceFailure = new Error('source failed');

    const projectionSource = controllable<number>();
    const projectionErrors: unknown[] = [];
    projectionSource.observable[switchScan](() => {
      throw projectionFailure;
    }, 0).subscribe({ error: (error) => projectionErrors.push(error) });
    projectionSource.subscriber.next(1);

    const conversionSource = controllable<number>();
    const conversionErrors: unknown[] = [];
    conversionSource.observable[switchScan](
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
    const innerErrors: unknown[] = [];
    innerSource.observable[switchScan](() => failingInner.observable, 0).subscribe({
      error: (error) => innerErrors.push(error),
    });
    innerSource.subscriber.next(1);
    failingInner.subscriber.error(innerFailure);

    const outerSource = controllable<number>();
    const activeInner = controllable<number>();
    const sourceErrors: unknown[] = [];
    outerSource.observable[switchScan](() => activeInner.observable, 0).subscribe({
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
    expect(outerSource.subscriber.active).toBe(false);
    expect(activeInner.subscriber.active).toBe(false);
  });

  it('handles a large synchronous source without recursive growth', () => {
    const count = 20_000;
    let seen = 0;
    let last = 0;
    let completed = false;

    Observable.from(Array.from({ length: count }, (_, index) => index + 1))
      [switchScan]((accumulator, value) => [accumulator + value], 0)
      .subscribe({
        next: (value) => {
          seen++;
          last = value;
        },
        complete: () => {
          completed = true;
        },
      });

    expect(seen).toBe(count);
    expect(last).toBe((count * (count + 1)) / 2);
    expect(completed).toBe(true);
  });

  it('shares and ref-counts one activation, then restarts with fresh seed and index state', () => {
    const source = tracked<number>();
    const inner = tracked<number>();
    const calls: Array<readonly [number, number, number]> = [];
    const result = source.observable[switchScan]((accumulator, value, index) => {
      calls.push([accumulator, value, index]);
      return inner.observable;
    }, 0);
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
    expect(inner.activations).toBe(1);
    inner.subscribers[0]?.next(5);
    expect(calls).toEqual([[0, 1, 0]]);
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

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    source.subscribers[1]?.next(2);
    expect(inner.activations).toBe(2);
    inner.subscribers[1]?.next(7);

    expect(calls.at(-1)).toEqual([0, 2, 0]);
    expect(restartedValues).toEqual([7]);

    restartController.abort();
    expect(source.subscribers[1]?.active).toBe(false);
    expect(inner.subscribers[1]?.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
} {
  let subscriber: Subscriber<T> | undefined;
  const observable = new Observable<T>((nextSubscriber) => {
    subscriber = nextSubscriber;
  });

  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('The controllable Observable is not active.');
      }
      return subscriber;
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
