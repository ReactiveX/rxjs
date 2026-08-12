import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type DelaySymbol = typeof import('./delay.js').delay;

let delay: DelaySymbol;

beforeAll(async () => {
  ({ delay } = await import('./delay.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('delay', () => {
  it('installs an exact Symbol operator with a host-time contract', () => {
    const result = Observable.from([1])[delay](10);
    const otherKey = Symbol('delay');
    type HasStringNamedDelay = 'delay' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedDelay>().toEqualTypeOf<false>();
    expect('delay' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(delay)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('delays values and completion until the final pending value', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const events: Array<number | 'complete'> = [];

    source.observable[delay](10).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    vi.advanceTimersByTime(4);
    source.subscriber.next(2);
    source.subscriber.complete();

    vi.advanceTimersByTime(6);
    expect(events).toEqual([1]);
    vi.advanceTimersByTime(4);
    expect(events).toEqual([1, 2, 'complete']);
  });

  it('uses a Date as one absolute release boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(100);
    const source = controllable<string>();
    const values: string[] = [];

    source.observable[delay](new Date(120)).subscribe((value) => values.push(value));
    source.subscriber.next('a');
    vi.advanceTimersByTime(10);
    source.subscriber.next('b');
    vi.advanceTimersByTime(10);

    expect(values).toEqual(['a', 'b']);
  });

  it('forwards errors immediately and cancels pending values', () => {
    vi.useFakeTimers();
    const failure = new Error('source failed');
    const source = controllable<number>();
    const events: unknown[] = [];

    source.observable[delay](10).subscribe({
      next: (value) => events.push(value),
      error: (error) => events.push(error),
    });
    source.subscriber.next(1);
    source.subscriber.error(failure);

    expect(events).toEqual([failure]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one active source and timer across concurrent platform observers', () => {
    vi.useFakeTimers();
    let activations = 0;
    let sourceSubscriber!: Subscriber<number>;
    const source = new Observable<number>((subscriber) => {
      activations++;
      sourceSubscriber = subscriber;
    });
    const delayed = source[delay](10);
    const first: number[] = [];
    const second: number[] = [];

    delayed.subscribe((value) => first.push(value));
    delayed.subscribe((value) => second.push(value));
    sourceSubscriber.next(1);
    vi.advanceTimersByTime(10);

    expect(activations).toBe(1);
    expect(first).toEqual([1]);
    expect(second).toEqual([1]);
  });
});

function controllable<T>(): {
  observable: Observable<T>;
  subscriber: Subscriber<T>;
} {
  let subscriber!: Subscriber<T>;
  return {
    observable: new Observable<T>((currentSubscriber) => {
      subscriber = currentSubscriber;
    }),
    get subscriber() {
      return subscriber;
    },
  };
}
