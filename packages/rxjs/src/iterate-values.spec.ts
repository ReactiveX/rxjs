import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { ColdObservable } from './cold-observable.js';
import { iterateBufferedValues } from './iterate-buffered-values.js';
import { iterateEachValue } from './iterate-each-value.js';
import { iterateLatestValue } from './iterate-latest-value.js';
import { iterateNextValue } from './iterate-next-value.js';

describe('Observable async iteration Symbols', () => {
  it('installs four exact Symbols without adding string-named properties', () => {
    const source = new Observable<number>(() => {});

    expect(source[iterateEachValue]).toBeTypeOf('function');
    expect(source[iterateBufferedValues]).toBeTypeOf('function');
    expect(source[iterateLatestValue]).toBeTypeOf('function');
    expect(source[iterateNextValue]).toBeTypeOf('function');
    expect(new Set([iterateEachValue, iterateBufferedValues, iterateLatestValue, iterateNextValue])).toHaveLength(4);

    expect('iterateEachValue' in source).toBe(false);
    expect('iterateBufferedValues' in source).toBe(false);
    expect('iterateLatestValue' in source).toBe(false);
    expect('iterateNextValue' in source).toBe(false);
  });

  it('returns precisely typed generators and does not subscribe until iteration begins', async () => {
    let activations = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      subscriber.complete();
    });

    const each = source[iterateEachValue]();
    const buffered = source[iterateBufferedValues]();
    const latest = source[iterateLatestValue]();
    const next = source[iterateNextValue]();

    expectTypeOf(each).toEqualTypeOf<AsyncGenerator<number, void, void>>();
    expectTypeOf(buffered).toEqualTypeOf<AsyncGenerator<number[], void, void>>();
    expectTypeOf(latest).toEqualTypeOf<AsyncGenerator<number, void, void>>();
    expectTypeOf(next).toEqualTypeOf<AsyncGenerator<number, void, void>>();
    expect(activations).toBe(0);

    await expect(each.next()).resolves.toEqual({ done: true, value: undefined });
    await expect(buffered.next()).resolves.toEqual({ done: true, value: undefined });
    await expect(latest.next()).resolves.toEqual({ done: true, value: undefined });
    await expect(next.next()).resolves.toEqual({ done: true, value: undefined });
    expect(activations).toBe(4);
  });

  it('locks the four synchronous-source strategies', async () => {
    const source = synchronousObservable(1, 2, 3);

    await expect(collect(source[iterateEachValue]())).resolves.toEqual([1, 2, 3]);
    await expect(collect(source[iterateBufferedValues]())).resolves.toEqual([[1, 2, 3]]);
    await expect(collect(source[iterateLatestValue]())).resolves.toEqual([3]);
    await expect(collect(source[iterateNextValue]())).resolves.toEqual([]);
  });

  it('queues every value for a delayed each-value consumer', async () => {
    const { source, getSubscriber } = controllableObservable<number>();
    const iterator = source[iterateEachValue]();
    const first = iterator.next();
    await nextMicrotask();

    const subscriber = getSubscriber();
    subscriber.next(0);
    subscriber.next(1);
    subscriber.next(2);

    await expect(first).resolves.toEqual({ done: false, value: 0 });
    await expect(iterator.next()).resolves.toEqual({ done: false, value: 1 });
    await expect(iterator.next()).resolves.toEqual({ done: false, value: 2 });

    subscriber.complete();
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
  });

  it('coalesces a same-turn burst into one buffered snapshot', async () => {
    const { source, getSubscriber } = controllableObservable<number>();
    const iterator = source[iterateBufferedValues]();
    const first = iterator.next();
    await nextMicrotask();

    const subscriber = getSubscriber();
    subscriber.next(0);
    subscriber.next(1);
    subscriber.next(2);

    await expect(first).resolves.toEqual({ done: false, value: [0, 1, 2] });

    const second = iterator.next();
    await nextMicrotask();
    subscriber.next(3);
    subscriber.next(4);
    await expect(second).resolves.toEqual({ done: false, value: [3, 4] });

    subscriber.complete();
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
  });

  it('coalesces a same-turn burst to the latest unread value', async () => {
    const { source, getSubscriber } = controllableObservable<number>();
    const iterator = source[iterateLatestValue]();
    const first = iterator.next();
    await nextMicrotask();

    const subscriber = getSubscriber();
    subscriber.next(0);
    subscriber.next(1);
    subscriber.next(2);

    await expect(first).resolves.toEqual({ done: false, value: 2 });

    const second = iterator.next();
    await nextMicrotask();
    subscriber.next(3);
    subscriber.next(4);
    await expect(second).resolves.toEqual({ done: false, value: 4 });

    subscriber.complete();
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
  });

  it('accepts only the first value after each next-value request', async () => {
    const { source, getSubscriber } = controllableObservable<number>();
    const iterator = source[iterateNextValue]();
    const first = iterator.next();
    await nextMicrotask();

    const subscriber = getSubscriber();
    subscriber.next(0);
    subscriber.next(1);
    subscriber.next(2);
    await expect(first).resolves.toEqual({ done: false, value: 0 });

    subscriber.next(3);
    subscriber.next(4);

    const second = iterator.next();
    await nextMicrotask();
    subscriber.next(5);
    subscriber.next(6);
    await expect(second).resolves.toEqual({ done: false, value: 5 });

    subscriber.complete();
    await expect(iterator.next()).resolves.toEqual({ done: true, value: undefined });
  });

  it('drains accepted values before surfacing a source error', async () => {
    const failure = new Error('source failed');
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error(failure);
    });

    await expect(collectWithError(source[iterateEachValue]())).resolves.toEqual({
      error: failure,
      values: [1, 2],
    });
    await expect(collectWithError(source[iterateBufferedValues]())).resolves.toEqual({
      error: failure,
      values: [[1, 2]],
    });
    await expect(collectWithError(source[iterateLatestValue]())).resolves.toEqual({
      error: failure,
      values: [2],
    });
    await expect(collectWithError(source[iterateNextValue]())).resolves.toEqual({
      error: failure,
      values: [],
    });
  });

  it.each([
    ['each value', (source: Observable<number>) => source[iterateEachValue]() as AsyncGenerator<unknown, void, void>],
    ['buffered values', (source: Observable<number>) => source[iterateBufferedValues]() as AsyncGenerator<unknown, void, void>],
    ['latest value', (source: Observable<number>) => source[iterateLatestValue]() as AsyncGenerator<unknown, void, void>],
    ['next value', (source: Observable<number>) => source[iterateNextValue]() as AsyncGenerator<unknown, void, void>],
  ])('aborts source work when a %s loop exits early', async (_name, createIterator) => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });

    const loop = async () => {
      for await (const _value of createIterator(source)) {
        break;
      }
    };

    const completion = loop();
    await nextMicrotask();
    sourceSubscriber?.next(1);
    await completion;

    expect(teardowns).toBe(1);
    expect(sourceSubscriber?.active).toBe(false);
  });

  it('aborts source work when the loop body throws', async () => {
    const failure = new Error('consumer failed');
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });

    const completion = (async () => {
      for await (const _value of source[iterateEachValue]()) {
        throw failure;
      }
    })();

    await nextMicrotask();
    sourceSubscriber?.next(1);
    await expect(completion).rejects.toBe(failure);
    expect(teardowns).toBe(1);
    expect(sourceSubscriber?.active).toBe(false);
  });

  it('aborts source work when the generator is explicitly closed', async () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const iterator = source[iterateEachValue]();
    const first = iterator.next();
    await nextMicrotask();
    sourceSubscriber?.next(1);
    await first;

    await iterator.return(undefined);

    expect(teardowns).toBe(1);
    expect(sourceSubscriber?.active).toBe(false);
  });

  it('keeps conversion state iterator-local while sharing and ref-counting the platform producer', async () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => teardowns++);
    });
    const firstIterator = source[iterateEachValue]();
    const secondIterator = source[iterateEachValue]();
    const first = firstIterator.next();
    const second = secondIterator.next();
    await nextMicrotask();

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next(1);
    await expect(first).resolves.toEqual({ done: false, value: 1 });
    await expect(second).resolves.toEqual({ done: false, value: 1 });

    await firstIterator.return(undefined);
    expect(sourceSubscribers[0]?.active).toBe(true);
    expect(teardowns).toBe(0);

    await secondIterator.return(undefined);
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(teardowns).toBe(1);

    const restarted = source[iterateEachValue]();
    const restartedResult = restarted.next();
    await nextMicrotask();
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next(2);
    await expect(restartedResult).resolves.toEqual({ done: false, value: 2 });
    await restarted.return(undefined);
    expect(teardowns).toBe(2);
  });

  it('retains producer-per-subscription behavior for ColdObservable iterators', async () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    const source = new ColdObservable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
    });
    const firstIterator = source[iterateEachValue]();
    const secondIterator = source[iterateEachValue]();
    const first = firstIterator.next();
    const second = secondIterator.next();
    await nextMicrotask();

    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[0]?.next(1);
    sourceSubscribers[1]?.next(2);
    await expect(first).resolves.toEqual({ done: false, value: 1 });
    await expect(second).resolves.toEqual({ done: false, value: 2 });

    await firstIterator.return(undefined);
    await secondIterator.return(undefined);
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceSubscribers[1]?.active).toBe(false);
  });
});

function synchronousObservable<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}

function controllableObservable<T>(): {
  source: Observable<T>;
  getSubscriber: () => Subscriber<T>;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  const source = new Observable<T>((subscriber) => {
    sourceSubscriber = subscriber;
  });

  return {
    source,
    getSubscriber: () => {
      if (!sourceSubscriber) {
        throw new Error('The source has not been activated');
      }
      return sourceSubscriber;
    },
  };
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const values: T[] = [];
  for await (const value of iterable) {
    values.push(value);
  }
  return values;
}

async function collectWithError<T>(iterable: AsyncIterable<T>): Promise<{ values: T[]; error: unknown }> {
  const values: T[] = [];
  try {
    for await (const value of iterable) {
      values.push(value);
    }
  } catch (error) {
    return { values, error };
  }
  throw new Error('Expected iteration to fail');
}

async function nextMicrotask(): Promise<void> {
  await Promise.resolve();
}
