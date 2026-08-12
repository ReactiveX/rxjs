import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type SubscribeOnSymbol = typeof import('./subscribe-on.js').subscribeOn;

let subscribeOn: SubscribeOnSymbol;

beforeAll(async () => {
  ({ subscribeOn } = await import('./subscribe-on.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('subscribeOn', () => {
  it('installs an exact host-delay Symbol and preserves the receiver constructor', () => {
    class DerivedObservable<T> extends Observable<T> {}

    const result = new DerivedObservable<number>(() => {})[subscribeOn]();
    type HasStringNamedSubscribeOn = 'subscribeOn' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expect(result).toBeInstanceOf(DerivedObservable);
    expectTypeOf<HasStringNamedSubscribeOn>().toEqualTypeOf<false>();
    expect('subscribeOn' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(subscribeOn)).toBeUndefined();
  });

  it('starts the source only after the host delay', () => {
    vi.useFakeTimers();
    let activations = 0;
    const values: number[] = [];
    const source = new Observable<number>((subscriber) => {
      activations++;
      subscriber.next(1);
      subscriber.complete();
    });

    source[subscribeOn](10).subscribe((value) => values.push(value));

    expect(activations).toBe(0);
    vi.advanceTimersByTime(9);
    expect(activations).toBe(0);
    vi.advanceTimersByTime(1);
    expect(activations).toBe(1);
    expect(values).toEqual([1]);
  });

  it('does not activate a source when canceled before its scheduled subscription', () => {
    vi.useFakeTimers();
    let activations = 0;
    const source = new Observable<number>(() => {
      activations++;
    });
    const controller = new AbortController();

    source[subscribeOn](10).subscribe(() => {}, { signal: controller.signal });
    controller.abort();
    vi.advanceTimersByTime(10);

    expect(activations).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats an infinite delay as a deliberately unstarted subscription', () => {
    vi.useFakeTimers();
    let activations = 0;
    const source = new Observable<number>(() => {
      activations++;
    });

    source[subscribeOn](Infinity).subscribe(() => {});
    vi.runAllTimers();

    expect(activations).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one scheduled source run and ref-counts cancellation', () => {
    vi.useFakeTimers();
    let sourceSubscriber: Subscriber<number> | undefined;
    let activations = 0;
    let teardowns = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => teardowns++);
    });
    const result = source[subscribeOn](10);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const first: number[] = [];
    const second: number[] = [];

    result.subscribe((value) => first.push(value), { signal: firstController.signal });
    result.subscribe((value) => second.push(value), { signal: secondController.signal });
    vi.advanceTimersByTime(10);
    sourceSubscriber?.next(1);

    expect(activations).toBe(1);
    expect(first).toEqual([1]);
    expect(second).toEqual([1]);

    firstController.abort();
    expect(teardowns).toBe(0);
    secondController.abort();
    expect(teardowns).toBe(1);
  });
});
