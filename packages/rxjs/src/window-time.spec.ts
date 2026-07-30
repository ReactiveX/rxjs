import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type WindowTimeSymbol = typeof import('./window-time.js').windowTime;

let windowTime: WindowTimeSymbol;

beforeAll(async () => {
  ({ windowTime } = await import('./window-time.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('windowTime', () => {
  it('installs an exact Symbol operator with a host-time contract', () => {
    const result = Observable.from([1])[windowTime](10);
    type HasStringNamedWindowTime = 'windowTime' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<Observable<number>>>();
    expectTypeOf<HasStringNamedWindowTime>().toEqualTypeOf<false>();
    expect('windowTime' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(windowTime)).toBeUndefined();
  });

  it('rotates sequential windows at the configured span', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const windows: number[][] = [];

    source.observable[windowTime](10).subscribe((window) => observeWindow(window, windows));
    source.subscriber.next(1);
    vi.advanceTimersByTime(10);
    source.subscriber.next(2);
    vi.advanceTimersByTime(10);

    expect(windows).toEqual([[1], [2], []]);
  });

  it('rotates sequential windows early at max size', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const windows: number[][] = [];

    source.observable[windowTime](10, null, 2).subscribe((window) => observeWindow(window, windows));
    source.subscriber.next(1);
    source.subscriber.next(2);
    source.subscriber.next(3);

    expect(windows).toEqual([[1, 2], [3]]);
  });

  it('opens overlapping windows at the creation interval', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const windows: number[][] = [];

    source.observable[windowTime](10, 6).subscribe((window) => observeWindow(window, windows));
    source.subscriber.next(1);
    vi.advanceTimersByTime(6);
    source.subscriber.next(2);
    vi.advanceTimersByTime(4);
    source.subscriber.next(3);
    vi.advanceTimersByTime(6);

    expect(windows).toEqual([
      [1, 2],
      [2, 3],
      [],
    ]);
  });

  it('completes active windows with the source and errors them on source error', () => {
    vi.useFakeTimers();
    const completedSource = controllable<number>();
    const completions: number[] = [];
    completedSource.observable[windowTime](10, 5).subscribe((window) => {
      window.subscribe({ complete: () => completions.push(1) });
    });
    vi.advanceTimersByTime(5);
    completedSource.subscriber.complete();
    expect(completions).toEqual([1, 1]);
    expect(vi.getTimerCount()).toBe(0);

    const failedSource = controllable<number>();
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    failedSource.observable[windowTime](10).subscribe({
      next: (window) => {
        window.subscribe({ error: (error) => errors.push(error) });
      },
      error: () => {},
    });
    failedSource.subscriber.error(failure);
    expect(errors).toEqual([failure]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not deliver a size-triggering value to a replacement window', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const windows: number[][] = [];

    source.observable[windowTime](10, null, 1).subscribe((window) => observeWindow(window, windows));
    source.subscriber.next(1);

    expect(windows).toEqual([[1], []]);
  });
});

function observeWindow<T>(window: Observable<T>, windows: T[][]): void {
  const values: T[] = [];
  windows.push(values);
  window.subscribe((value) => values.push(value));
}

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
