import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { throttle } from './throttle.js';

describe('throttle', () => {
  it('opens a leading window and emits the next value after its duration ends', () => {
    const source = controllable<number>();
    const durations: Controllable<void>[] = [];
    const results: Array<number | 'complete'> = [];
    const throttled = source.observable[throttle](() => {
      const duration = controllable<void>();
      durations.push(duration);
      return duration.observable;
    });

    expectTypeOf(throttled).toEqualTypeOf<Observable<number>>();
    throttled.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.next(2);
    durations[0]!.subscriber.next(undefined);
    source.subscriber.next(3);

    expect(results).toEqual([1, 3]);
    expect(durations).toHaveLength(2);

    source.subscriber.complete();
    expect(results).toEqual([1, 3, 'complete']);
    expect(durations[1]!.subscriber.active).toBe(false);
  });

  it('starts a leading-false window and emits its latest value on a duration value', () => {
    const source = controllable<number>();
    const durations: Controllable<void>[] = [];
    const results: number[] = [];
    const audited = source.observable[throttle](
      () => {
        const duration = controllable<void>();
        durations.push(duration);
        return duration.observable;
      },
      { leading: false, trailing: true }
    );

    audited.subscribe((value) => results.push(value));
    source.subscriber.next(1);
    source.subscriber.next(2);

    expect(results).toEqual([]);
    expect(durations).toHaveLength(1);

    durations[0]!.subscriber.next(undefined);

    expect(results).toEqual([2]);
    expect(durations).toHaveLength(2);
  });

  it('waits for a pending trailing value before completing', () => {
    const source = controllable<number>();
    const duration = controllable<void>();
    const results: Array<number | 'complete'> = [];

    source.observable[throttle](() => duration.observable, { leading: false, trailing: true }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.next(2);
    source.subscriber.complete();
    expect(results).toEqual([]);

    duration.subscriber.next(undefined);
    expect(results).toEqual([2, 'complete']);
  });

  it('does not emit a trailing value when the duration only completes', () => {
    const source = controllable<number>();
    const duration = controllable<void>();
    const results: Array<number | 'complete'> = [];

    source.observable[throttle](() => duration.observable, { leading: false, trailing: true }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    source.subscriber.next(1);
    duration.subscriber.complete();
    source.subscriber.complete();

    expect(results).toEqual(['complete']);
  });

  it('cancels source and duration work when the last observer leaves', () => {
    const source = controllable<number>();
    const duration = controllable<void>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const throttled = source.observable[throttle](() => duration.observable);

    throttled.subscribe(null, { signal: firstController.signal });
    throttled.subscribe(null, { signal: secondController.signal });
    source.subscriber.next(1);

    expect(source.subscriptions).toBe(1);
    expect(duration.subscriptions).toBe(1);

    firstController.abort();
    expect(source.subscriber.active).toBe(true);
    expect(duration.subscriber.active).toBe(true);

    secondController.abort();
    expect(source.subscriber.active).toBe(false);
    expect(duration.subscriber.active).toBe(false);
  });

  it('forwards selector and duration errors and cancels the source', () => {
    const selectorFailure = new Error('selector failed');
    const selectorSource = controllable<number>();
    const selectorErrors: unknown[] = [];

    selectorSource.observable[throttle](() => {
      throw selectorFailure;
    }).subscribe({ error: (error) => selectorErrors.push(error) });
    selectorSource.subscriber.next(1);

    expect(selectorErrors).toEqual([selectorFailure]);
    expect(selectorSource.subscriber.active).toBe(false);

    const durationFailure = new Error('duration failed');
    const durationSource = controllable<number>();
    const duration = controllable<void>();
    const durationErrors: unknown[] = [];

    durationSource.observable[throttle](() => duration.observable).subscribe({
      error: (error) => durationErrors.push(error),
    });
    durationSource.subscriber.next(1);
    duration.subscriber.error(durationFailure);

    expect(durationErrors).toEqual([durationFailure]);
    expect(durationSource.subscriber.active).toBe(false);
  });
});

describe('throttle with a numeric duration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for the next source value before starting another audit window', () => {
    const source = controllable<number>();
    const values: number[] = [];

    source.observable[throttle](5, { leading: false, trailing: true, restartOnTrailing: false }).subscribe((value) => {
      values.push(value);
    });
    source.subscriber.next(1);
    vi.advanceTimersByTime(4);
    source.subscriber.next(2);
    vi.advanceTimersByTime(1);

    expect(values).toEqual([2]);
    expect(vi.getTimerCount()).toBe(0);

    source.subscriber.next(3);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(5);

    expect(values).toEqual([2, 3]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one source and timer until the final observer leaves', () => {
    const source = controllable<number>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const throttled = source.observable[throttle](10);

    throttled.subscribe(() => {}, { signal: firstController.signal });
    throttled.subscribe(() => {}, { signal: secondController.signal });
    source.subscriber.next(1);

    expect(source.subscriptions).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    firstController.abort();
    expect(source.subscriber.active).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    secondController.abort();
    expect(source.subscriber.active).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

interface Controllable<T> {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
}

function controllable<T>(): Controllable<T> {
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
