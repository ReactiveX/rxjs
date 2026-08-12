import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type ObserveOnSymbol = typeof import('./observe-on.js').observeOn;

let observeOn: ObserveOnSymbol;

beforeAll(async () => {
  ({ observeOn } = await import('./observe-on.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('observeOn', () => {
  it('installs an exact host-delay Symbol and preserves the receiver constructor', () => {
    class DerivedObservable<T> extends Observable<T> {}

    const result = new DerivedObservable<number>(() => {})[observeOn]();
    type HasStringNamedObserveOn = 'observeOn' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expect(result).toBeInstanceOf(DerivedObservable);
    expectTypeOf<HasStringNamedObserveOn>().toEqualTypeOf<false>();
    expect('observeOn' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(observeOn)).toBeUndefined();
  });

  it('delivers values and completion in source order after the host delay', () => {
    vi.useFakeTimers();
    const events: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    source[observeOn](10).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([]);
    vi.advanceTimersByTime(9);
    expect(events).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(events).toEqual([1, 2, 'complete']);
  });

  it('delivers source errors after already queued values', () => {
    vi.useFakeTimers();
    const failure = new Error('source failed');
    const events: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[observeOn](5).subscribe({
      next: (value) => events.push(value),
      error: (error) => events.push(error),
    });
    vi.advanceTimersByTime(5);

    expect(events).toEqual([1, failure]);
  });

  it('clears queued notifications and cancels the source through AbortSignal', () => {
    vi.useFakeTimers();
    let sourceSubscriber: Subscriber<number> | undefined;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const controller = new AbortController();
    const values: number[] = [];

    source[observeOn](10).subscribe((value) => values.push(value), { signal: controller.signal });
    sourceSubscriber?.next(1);
    controller.abort();
    vi.advanceTimersByTime(10);

    expect(values).toEqual([]);
    expect(sourceSubscriber?.active).toBe(false);
    expect(teardowns).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one scheduled run and ref-counts source cancellation', () => {
    vi.useFakeTimers();
    let sourceSubscriber: Subscriber<number> | undefined;
    let activations = 0;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const result = source[observeOn](10);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first: number[] = [];
    const second: number[] = [];

    result.subscribe((value) => first.push(value), { signal: firstController.signal });
    result.subscribe((value) => second.push(value), { signal: secondController.signal });
    sourceSubscriber?.next(1);
    vi.advanceTimersByTime(10);

    expect(activations).toBe(1);
    expect(first).toEqual([1]);
    expect(second).toEqual([1]);

    firstController.abort();
    expect(teardowns).toBe(0);
    secondController.abort();
    expect(teardowns).toBe(1);
  });
});
