import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type PublishReplaySymbol = typeof import('./publish-replay.js').publishReplay;
type RepeatSymbol = typeof import('./repeat.js').repeat;
type RetrySymbol = typeof import('./retry.js').retry;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;

let publishReplay: PublishReplaySymbol;
let repeat: RepeatSymbol;
let retry: RetrySymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'publishReplay' in Observable.prototype;
  [{ publishReplay }, { repeat }, { retry }] = await Promise.all([
    import('./publish-replay.js'),
    import('./repeat.js'),
    import('./retry.js'),
  ]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('publishReplay', () => {
  it('installs only its exact unique Symbol and preserves supported omission and selector call shapes', () => {
    const source = Observable.from([1, 2]);
    const defaults = source[publishReplay]();
    const sized = source[publishReplay](2);
    const windowed = source[publishReplay](2, 100);
    const explicitOmissions = source[publishReplay](undefined, undefined, undefined);
    const selected = source[publishReplay](2, 100, (shared) => {
      expectTypeOf(shared).toEqualTypeOf<Observable<number>>();
      return Promise.resolve({ selected: true });
    });
    const selectedWithoutBounds = source[publishReplay](undefined, undefined, (shared) => shared, undefined);
    const otherKey = Symbol('publishReplay');
    type HasStringNamedPublishReplay = 'publishReplay' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(defaults).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(sized).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(windowed).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(explicitOmissions).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(selected).toEqualTypeOf<Observable<{ selected: boolean }>>();
    expectTypeOf(selectedWithoutBounds).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedPublishReplay>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('publishReplay' in Observable.prototype).toBe(false);
    expect('refCount' in defaults).toBe(false);
    expect(publishReplay.description).toBe('publishReplay');
    expect(Symbol.keyFor(publishReplay)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error bufferSize is numeric.
      source[publishReplay]('2');
      // @ts-expect-error windowTime is numeric.
      source[publishReplay](2, '100');
      // @ts-expect-error A selector must return an ObservableValue.
      source[publishReplay](2, 100, () => 1);
    }
  });

  it('rejects every defined scheduler-last object instead of silently ignoring it', () => {
    const source = Observable.from([1]);
    const scheduler = { now: () => 0 };

    expect(() => source[publishReplay](1, Infinity, scheduler)).toThrow(
      'Scheduler-backed publishReplay is not supported by this Symbol contract.'
    );
    expect(() => source[publishReplay](1, Infinity, undefined, scheduler)).toThrow(
      'Scheduler-backed publishReplay is not supported by this Symbol contract.'
    );
    expect(() => source[publishReplay](1, Infinity, (shared) => shared, scheduler)).toThrow(
      'Scheduler-backed publishReplay is not supported by this Symbol contract.'
    );
    expect(() =>
      (source[publishReplay] as (bufferSize: number, windowTime: number, scheduler: unknown) => ConnectableObservableType<number>)(
        1,
        Infinity,
        null
      )
    ).toThrow('Scheduler-backed publishReplay is not supported by this Symbol contract.');
    expect(() => source[publishReplay](1, Infinity, undefined)).not.toThrow();
    expect(() => source[publishReplay](1, Infinity, (shared) => shared, undefined)).not.toThrow();
  });

  it('retains and replays the configured size-bounded buffer after completion', () => {
    const source = tracked<number>();
    const result = source.observable[publishReplay](2);
    const firstEvents: Array<number | 'complete'> = [];
    const lateEvents: Array<number | 'complete'> = [];

    result.subscribe({
      next: (value) => firstEvents.push(value),
      complete: () => firstEvents.push('complete'),
    });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    source.subscribers[0]!.next(3);
    source.subscribers[0]!.complete();

    result.subscribe({
      next: (value) => lateEvents.push(value),
      complete: () => lateEvents.push('complete'),
    });

    expect(firstEvents).toEqual([1, 2, 3, 'complete']);
    expect(lateEvents).toEqual([2, 3, 'complete']);
    expect(connection.closed).toBe(true);
  });

  it('uses host time to expire replay values before a terminal late subscription', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    const source = tracked<number>();
    const result = source.observable[publishReplay](3, 100);
    const lateEvents: Array<number | 'complete'> = [];

    result.subscribe(() => {});
    result.connect();
    source.subscribers[0]!.next(1);
    vi.advanceTimersByTime(50);
    source.subscribers[0]!.next(2);
    source.subscribers[0]!.complete();
    vi.advanceTimersByTime(51);

    result.subscribe({
      next: (value) => lateEvents.push(value),
      complete: () => lateEvents.push('complete'),
    });

    expect(lateEvents).toEqual([2, 'complete']);
  });

  it('replays buffered values before a retained source error and completes empty sources without values', () => {
    const failure = new Error('source failed');
    const failingSource = tracked<number>();
    const failing = failingSource.observable[publishReplay](2);
    const lateErrorEvents: unknown[] = [];

    failing.subscribe({ error: () => {} });
    const failedConnection = failing.connect();
    failingSource.subscribers[0]!.next(1);
    failingSource.subscribers[0]!.next(2);
    failingSource.subscribers[0]!.error(failure);
    failing.subscribe({
      next: (value) => lateErrorEvents.push(value),
      error: (error) => lateErrorEvents.push(['error', error]),
    });

    const emptySource = tracked<number>();
    const empty = emptySource.observable[publishReplay](2);
    const emptyEvents: Array<number | 'complete'> = [];

    empty.subscribe({
      next: (value) => emptyEvents.push(value),
      complete: () => emptyEvents.push('complete'),
    });
    const emptyConnection = empty.connect();
    emptySource.subscribers[0]!.complete();

    expect(lateErrorEvents).toEqual([1, 2, ['error', failure]]);
    expect(failedConnection.closed).toBe(true);
    expect(emptyEvents).toEqual(['complete']);
    expect(emptyConnection.closed).toBe(true);
  });

  it('retains replay state across explicit disconnect and reconnect', () => {
    const source = tracked<number>();
    const result = source.observable[publishReplay](2);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    firstConnection.unsubscribe();
    firstController.abort();

    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(3);

    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([1, 2, 3]);
    expect(source.activations).toBe(2);

    secondConnection.unsubscribe();
    secondController.abort();
  });

  it('documents that an active platform late observer cannot receive connector replay', () => {
    const source = tracked<number>();
    const result = source.observable[publishReplay](2);
    const firstValues: number[] = [];
    const lateValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    result.subscribe((value) => lateValues.push(value));

    expect(firstValues).toEqual([1, 2]);
    expect(lateValues).toEqual([]);

    source.subscribers[0]!.next(3);

    expect(firstValues).toEqual([1, 2, 3]);
    expect(lateValues).toEqual([3]);

    connection.unsubscribe();
  });

  it('prewires selector subscriptions before one source connection', () => {
    const events: string[] = [];
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      events.push('source active');
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    const values: string[] = [];

    source[publishReplay](2, Infinity, (shared) => {
      events.push('selector');
      return new Observable<string>((subscriber) => {
        events.push('selector result active');
        shared.subscribe(
          {
            next: (value) => subscriber.next(`value ${value}`),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete(),
          },
          { signal: subscriber.signal }
        );
      });
    }).subscribe((value) => values.push(value));

    expect(sourceActivations).toBe(1);
    expect(events).toEqual(['selector', 'selector result active', 'source active']);
    expect(values).toEqual(['value 1', 'value 2']);
  });

  it('retains replay state across cancelled selector runs', () => {
    const source = tracked<number>();
    const result = source.observable[publishReplay](2, Infinity, (shared) => shared);
    const firstController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const restartedValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    source.subscribers[0]!.next(1);
    firstController.abort();

    expect(source.subscribers[0]!.active).toBe(false);

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });

    expect(source.activations).toBe(2);
    expect(restartedValues).toEqual([1]);

    source.subscribers[1]!.next(2);
    expect(firstValues).toEqual([1]);
    expect(restartedValues).toEqual([1, 2]);

    restartController.abort();
  });

  it('reuses the terminal replay subject when selector results repeat', () => {
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.complete();
    });
    const values: number[] = [];
    let completions = 0;

    source[publishReplay](1, Infinity, (shared) => shared)
      [repeat]({ count: 3 })
      .subscribe({
        next: (value) => values.push(value),
        complete: () => completions++,
      });

    expect(sourceActivations).toBe(1);
    expect(values).toEqual([1, 1, 1]);
    expect(completions).toBe(1);
  });

  it('reuses the terminal replay subject when selector results retry', () => {
    const failure = new Error('source failed');
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.error(failure);
    });
    const values: number[] = [];
    const errors: unknown[] = [];

    source[publishReplay](1, Infinity, (shared) => shared)
      [retry]({ count: 2, resetOnSuccess: false })
      .subscribe({
        next: (value) => values.push(value),
        error: (error) => errors.push(error),
      });

    expect(sourceActivations).toBe(1);
    expect(values).toEqual([1, 1, 1]);
    expect(errors).toEqual([failure]);
  });

  it('publishes the manual connection before synchronous reentrant replay fanout', () => {
    let sourceActivations = 0;
    let result: ConnectableObservableType<number>;
    let reentrantConnection: ReturnType<ConnectableObservableType<number>['connect']> | undefined;
    const values: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = source[publishReplay](2);

    result.subscribe((value) => {
      values.push(value);
      if (!reentrantConnection) {
        reentrantConnection = result.connect();
      }
    });
    const connection = result.connect();

    expect(sourceActivations).toBe(1);
    expect(reentrantConnection).toBe(connection);
    expect(connection.closed).toBe(true);
    expect(values).toEqual([1, 2]);
  });
});

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
} {
  const subscribers: Subscriber<T>[] = [];
  let activations = 0;
  const observable = new Observable<T>((subscriber) => {
    activations++;
    subscribers.push(subscriber);
  });
  return {
    observable,
    subscribers,
    get activations() {
      return activations;
    },
  };
}
