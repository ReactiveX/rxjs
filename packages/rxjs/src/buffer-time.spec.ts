import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type BufferTimeSymbol = typeof import('./buffer-time.js').bufferTime;

let bufferTime: BufferTimeSymbol;

beforeAll(async () => {
  ({ bufferTime } = await import('./buffer-time.js'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('bufferTime', () => {
  it('installs an exact Symbol operator with a host-time contract', () => {
    const result = Observable.from([1])[bufferTime](10);
    type HasStringNamedBufferTime = 'bufferTime' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<number[]>>();
    expectTypeOf<HasStringNamedBufferTime>().toEqualTypeOf<false>();
    expect('bufferTime' in Observable.prototype).toBe(false);
    expect(Symbol.keyFor(bufferTime)).toBeUndefined();
  });

  it('emits sequential buffers at the configured span', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[][] = [];

    source.observable[bufferTime](10).subscribe((value) => values.push(value));
    source.subscriber.next(1);
    vi.advanceTimersByTime(6);
    source.subscriber.next(2);
    vi.advanceTimersByTime(4);
    source.subscriber.next(3);
    vi.advanceTimersByTime(10);

    expect(values).toEqual([
      [1, 2],
      [3],
    ]);
  });

  it('closes sequential buffers early at max size and restarts the span', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[][] = [];

    source.observable[bufferTime](10, null, 2).subscribe((value) => values.push(value));
    source.subscriber.next(1);
    vi.advanceTimersByTime(4);
    source.subscriber.next(2);
    vi.advanceTimersByTime(9);
    source.subscriber.next(3);
    vi.advanceTimersByTime(1);

    expect(values).toEqual([
      [1, 2],
      [3],
    ]);
  });

  it('opens overlapping buffers at the creation interval', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[][] = [];

    source.observable[bufferTime](10, 6).subscribe((value) => values.push(value));
    source.subscriber.next(1);
    vi.advanceTimersByTime(6);
    source.subscriber.next(2);
    vi.advanceTimersByTime(4);
    source.subscriber.next(3);
    vi.advanceTimersByTime(6);

    expect(values).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });

  it('flushes active buffers on completion and discards them on error', () => {
    vi.useFakeTimers();
    const completedSource = controllable<number>();
    const completed: Array<number[] | 'complete'> = [];
    completedSource.observable[bufferTime](10, 5).subscribe({
      next: (value) => completed.push(value),
      complete: () => completed.push('complete'),
    });
    completedSource.subscriber.next(1);
    vi.advanceTimersByTime(5);
    completedSource.subscriber.next(2);
    completedSource.subscriber.complete();

    expect(completed).toEqual([[1, 2], [2], 'complete']);

    const failedSource = controllable<number>();
    const failure = new Error('source failed');
    const failed: unknown[] = [];
    failedSource.observable[bufferTime](10).subscribe({
      next: (value) => failed.push(value),
      error: (error) => failed.push(error),
    });
    failedSource.subscriber.next(1);
    failedSource.subscriber.error(failure);

    expect(failed).toEqual([failure]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not mutate an emitted buffer during a reentrant source value', () => {
    vi.useFakeTimers();
    const source = controllable<number>();
    const values: number[][] = [];

    source.observable[bufferTime](10).subscribe((value) => {
      values.push(value);
      source.subscriber.next(2);
    });
    source.subscriber.next(1);
    vi.advanceTimersByTime(10);

    expect(values[0]).toEqual([1]);
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
