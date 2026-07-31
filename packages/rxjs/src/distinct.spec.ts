import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type DistinctSymbol = typeof import('./distinct.js').distinct;

let distinct: DistinctSymbol;
let hadStringDistinct: boolean;

beforeAll(async () => {
  hadStringDistinct = 'distinct' in Observable.prototype;
  ({ distinct } = await import('./distinct.js'));
});

describe('distinct', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringDistinct).toBe(false);
    expect('distinct' in Observable.prototype).toBe(false);
    expect(distinct.description).toBe('distinct');
    expect(Symbol.keyFor(distinct)).toBeUndefined();
  });

  it('emits each value once using Set equality', () => {
    const object = { id: 1 };
    const results: unknown[] = [];
    const output = fromValues<unknown>(1, 1, NaN, NaN, 0, -0, object, object, { id: 1 })[distinct]();
    expectTypeOf(output).toEqualTypeOf<Observable<unknown>>();

    output.subscribe((value) => results.push(value));

    expect(results).toEqual([1, NaN, 0, object, { id: 1 }]);
  });

  it('selects keys and emits the original values', () => {
    const selected: string[] = [];
    const results: string[] = [];

    fromValues({ label: 'Alpha' }, { label: 'ALPHA' }, { label: 'Beta' })
      [distinct]((value) => {
        selected.push(value.label);
        return value.label.toLowerCase();
      })
      .subscribe((value) => results.push(value.label));

    expect(selected).toEqual(['Alpha', 'ALPHA', 'Beta']);
    expect(results).toEqual(['Alpha', 'Beta']);
  });

  it('clears remembered keys whenever the flush source emits', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let flushSubscriber: Subscriber<void> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
    });
    const flushes = new Observable<void>((subscriber) => {
      flushSubscriber = subscriber;
    });
    const results: number[] = [];

    source[distinct](undefined, flushes).subscribe((value) => results.push(value));
    sourceSubscriber?.next(1);
    sourceSubscriber?.next(1);
    flushSubscriber?.next(undefined);
    sourceSubscriber?.next(1);

    expect(results).toEqual([1, 1]);
  });

  it('subscribes to the source first and does not acquire flushes after synchronous termination', () => {
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source');
      subscriber.complete();
    });
    const flushes = {
      [Symbol.iterator]() {
        events.push('flush');
        return [undefined][Symbol.iterator]();
      },
    };

    source[distinct](undefined, flushes).subscribe({
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['source', 'complete']);
  });

  it('forwards key-selector errors and cancels synchronous source work', () => {
    const failure = new Error('key failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    const source = synchronousValues([1, 2, 3], produced);

    source
      [distinct]((value) => {
        if (value === 2) {
          throw failure;
        }
        return value;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(produced).toEqual([1, 2]);
    expect(errors).toEqual([failure]);
  });

  it('forwards source and flush errors and cancels the sibling subscription', () => {
    const sourceFailure = new Error('source failed');
    const flushFailure = new Error('flush failed');
    const sourceErrors: unknown[] = [];
    const flushErrors: unknown[] = [];
    const sourceWithError = new Observable<number>((subscriber) => subscriber.error(sourceFailure));

    sourceWithError[distinct]().subscribe({
      error: (error) => sourceErrors.push(error),
    });

    const source = controllable<number>();
    const flushes = controllable<void>();
    source.observable[distinct](undefined, flushes.observable).subscribe({
      error: (error) => flushErrors.push(error),
    });
    flushes.subscriber.error(flushFailure);

    expect(sourceErrors).toEqual([sourceFailure]);
    expect(flushErrors).toEqual([flushFailure]);
    expect(source.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('propagates result cancellation to both the source and flushes', () => {
    const source = controllable<number>();
    const flushes = controllable<void>();
    const controller = new AbortController();

    source.observable[distinct](undefined, flushes.observable).subscribe(() => {}, { signal: controller.signal });
    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(flushes.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(flushes.teardowns).toBe(1);
  });

  it('shares keys and flush work, ref-counts observers, and resets state on restart', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    const flushSubscribers: Subscriber<void>[] = [];
    const source = new Observable<number>((subscriber) => sourceSubscribers.push(subscriber));
    const flushes = new Observable<void>((subscriber) => flushSubscribers.push(subscriber));
    const output = source[distinct](undefined, flushes);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    output.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    output.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscribers[0]?.next(1);
    sourceSubscribers[0]?.next(1);

    expect(sourceSubscribers).toHaveLength(1);
    expect(flushSubscribers).toHaveLength(1);
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1]);

    firstController.abort();
    flushSubscribers[0]?.next(undefined);
    sourceSubscribers[0]?.next(1);

    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1, 1]);

    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(flushSubscribers[0]?.active).toBe(false);

    const restartedResults: number[] = [];
    output.subscribe((value) => restartedResults.push(value));
    sourceSubscribers[1]?.next(1);

    expect(sourceSubscribers).toHaveLength(2);
    expect(flushSubscribers).toHaveLength(2);
    expect(restartedResults).toEqual([1]);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        break;
      }
      subscriber.next(value);
    }
    subscriber.complete();
  });
}

function synchronousValues<T>(values: readonly T[], produced: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        break;
      }
      produced.push(value);
      subscriber.next(value);
    }
  });
}

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    sourceSubscriber = subscriber;
    subscriber.addTeardown(() => {
      teardowns++;
    });
  });

  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('The controllable source is not active.');
      }
      return sourceSubscriber;
    },
    get teardowns() {
      return teardowns;
    },
  };
}
