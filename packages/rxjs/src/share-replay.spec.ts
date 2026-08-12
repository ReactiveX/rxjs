import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type ShareReplaySymbol = typeof import('./share-replay.js').shareReplay;
type ShareReplayConfig = import('./share-replay.js').ShareReplayConfig;
type ColdObservableCtor = typeof import('./cold-observable.js').ColdObservable;

let shareReplay: ShareReplaySymbol;
let ColdObservable: ColdObservableCtor;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'shareReplay' in Observable.prototype;
  ({ shareReplay } = await import('./share-replay.js'));
  ({ ColdObservable } = await import('./cold-observable.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('shareReplay', () => {
  it('installs only its exact unique Symbol and preserves config and numeric overloads', () => {
    const source = Observable.from([1, 2]);
    const config: ShareReplayConfig = {
      bufferSize: 2,
      windowTime: 100,
      refCount: true,
    };
    const configured = source[shareReplay](config);
    const numeric = source[shareReplay](2, 100);
    const defaults = source[shareReplay]();
    const otherKey = Symbol('shareReplay');
    type HasStringNamedShareReplay = 'shareReplay' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(configured).toEqualTypeOf<Observable<number>>();
    expectTypeOf(numeric).toEqualTypeOf<Observable<number>>();
    expectTypeOf(defaults).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedShareReplay>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('shareReplay' in Observable.prototype).toBe(false);
    expect(shareReplay.description).toBe('shareReplay');
    expect(Symbol.keyFor(shareReplay)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error The RxJS 7 config overload requires refCount.
      source[shareReplay]({ bufferSize: 1 });
      // @ts-expect-error The first numeric-overload argument is a number.
      source[shareReplay]('1');
      // @ts-expect-error windowTime is numeric.
      source[shareReplay](1, new Date());
    }
  });

  it('rejects every defined numeric or config scheduler instead of silently ignoring it', () => {
    const source = Observable.from([1]);
    const scheduler = { now: () => 0 };

    expect(() => source[shareReplay](1, Infinity, scheduler)).toThrow(
      'Scheduler-backed shareReplay is not supported by this Symbol contract.'
    );
    expect(() =>
      source[shareReplay]({
        bufferSize: 1,
        refCount: false,
        scheduler,
      })
    ).toThrow('Scheduler-backed shareReplay is not supported by this Symbol contract.');
    expect(() =>
      (source[shareReplay] as (config: ShareReplayConfig, windowTime: number | undefined, scheduler: unknown) => Observable<number>)(
        { bufferSize: 1, refCount: false },
        undefined,
        scheduler
      )
    ).toThrow('Scheduler-backed shareReplay is not supported by this Symbol contract.');
    expect(() => source[shareReplay](1, Infinity, null)).toThrow('Scheduler-backed shareReplay is not supported by this Symbol contract.');
    expect(() => source[shareReplay](1, Infinity, undefined)).not.toThrow();
    expect(() =>
      source[shareReplay]({
        bufferSize: 1,
        refCount: false,
        scheduler: undefined,
      })
    ).not.toThrow();
  });

  it('replays the configured buffer after completion through a new platform activation', () => {
    const source = tracked<number>();
    const shared = source.observable[shareReplay](2);
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    let firstCompletions = 0;
    let lateCompletions = 0;

    shared.subscribe({
      next: (value) => firstValues.push(value),
      complete: () => firstCompletions++,
    });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    source.subscribers[0]!.next(3);
    source.subscribers[0]!.complete();

    shared.subscribe({
      next: (value) => lateValues.push(value),
      complete: () => lateCompletions++,
    });

    expect(firstValues).toEqual([1, 2, 3]);
    expect(lateValues).toEqual([2, 3]);
    expect(firstCompletions).toBe(1);
    expect(lateCompletions).toBe(1);
    expect(source.activations).toBe(1);
  });

  it('documents that an active platform late observer cannot receive connector replay', () => {
    const source = tracked<number>();
    const shared = source.observable[shareReplay](2);
    const firstValues: number[] = [];
    const lateValues: number[] = [];

    shared.subscribe((value) => firstValues.push(value));
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    shared.subscribe((value) => lateValues.push(value));

    // The late observer joins the already-active platform Subscriber and does
    // not re-enter shareReplay's replaying connector.
    expect(firstValues).toEqual([1, 2]);
    expect(lateValues).toEqual([]);

    source.subscribers[0]!.next(3);

    expect(firstValues).toEqual([1, 2, 3]);
    expect(lateValues).toEqual([3]);
    expect(source.activations).toBe(1);
  });

  it('replays to late ColdObservable subscribers through the connector', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActivations = 0;
    const source = new ColdObservable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
    });
    const shared = source[shareReplay](2);
    const firstValues: number[] = [];
    const lateValues: number[] = [];

    shared.subscribe((value) => firstValues.push(value));
    sourceSubscriber?.next(1);
    sourceSubscriber?.next(2);
    sourceSubscriber?.next(3);
    shared.subscribe((value) => lateValues.push(value));

    expect(sourceActivations).toBe(1);
    expect(firstValues).toEqual([1, 2, 3]);
    expect(lateValues).toEqual([2, 3]);

    sourceSubscriber?.next(4);
    expect(firstValues).toEqual([1, 2, 3, 4]);
    expect(lateValues).toEqual([2, 3, 4]);
  });

  it('resets its connector and source after an error', () => {
    const failure = new Error('source failed');
    const source = tracked<number>();
    const shared = source.observable[shareReplay](2);
    const firstValues: number[] = [];
    const errors: unknown[] = [];
    const restartedValues: number[] = [];

    shared.subscribe({
      next: (value) => firstValues.push(value),
      error: (error) => errors.push(error),
    });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.error(failure);

    shared.subscribe((value) => restartedValues.push(value));

    expect(source.activations).toBe(2);
    expect(firstValues).toEqual([1]);
    expect(errors).toEqual([failure]);
    expect(restartedValues).toEqual([]);

    source.subscribers[1]!.next(2);
    expect(restartedValues).toEqual([2]);
  });

  it('keeps the default ref-count-zero connection and replays values emitted through the gap', () => {
    const source = tracked<number>();
    const shared = source.observable[shareReplay](2);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const secondValues: number[] = [];

    shared.subscribe(() => {}, { signal: firstController.signal });
    source.subscribers[0]!.next(1);
    firstController.abort();

    expect(source.subscribers[0]!.active).toBe(true);
    source.subscribers[0]!.next(2);

    shared.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(secondValues).toEqual([1, 2]);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    source.subscribers[0]!.complete();
  });

  it('disconnects and clears the replay buffer at ref-count zero when configured', () => {
    const source = tracked<number>();
    const shared = source.observable[shareReplay]({
      bufferSize: 2,
      refCount: true,
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const secondValues: number[] = [];

    shared.subscribe(() => {}, { signal: firstController.signal });
    source.subscribers[0]!.next(1);
    firstController.abort();

    expect(source.subscribers[0]!.active).toBe(false);

    shared.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(source.activations).toBe(2);
    expect(secondValues).toEqual([]);

    source.subscribers[1]!.next(2);
    expect(secondValues).toEqual([2]);

    secondController.abort();
  });

  it('retains a completed cache even when refCount is true', () => {
    const source = tracked<number>();
    const shared = source.observable[shareReplay]({
      bufferSize: 1,
      refCount: true,
    });
    const lateValues: number[] = [];
    let lateCompletions = 0;

    shared.subscribe(() => {});
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    shared.subscribe({
      next: (value) => lateValues.push(value),
      complete: () => lateCompletions++,
    });

    expect(source.activations).toBe(1);
    expect(lateValues).toEqual([1]);
    expect(lateCompletions).toBe(1);
  });

  it('trims replay by host time through replaySubject Date.now and setTimeout', () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new ColdObservable<number>((subscriber) => {
      sourceSubscriber = subscriber;
    });
    const shared = source[shareReplay](3, 100);
    const lateValues: number[] = [];

    shared.subscribe(() => {});
    sourceSubscriber?.next(1);
    vi.advanceTimersByTime(50);
    sourceSubscriber?.next(2);
    vi.advanceTimersByTime(51);
    shared.subscribe((value) => lateValues.push(value));

    expect(Date.now()).toBe(101);
    expect(lateValues).toEqual([2]);
  });
});

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
} {
  const subscribers: Subscriber<T>[] = [];
  const observable = new Observable<T>((subscriber) => {
    subscribers.push(subscriber);
  });

  return {
    observable,
    subscribers,
    get activations() {
      return subscribers.length;
    },
  };
}
