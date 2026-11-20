import { afterEach, describe, expect, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { timer } from './timer.js';
import { ColdObservable } from './cold-observable.js';

describe('timer', () => {
  afterEach(() => vi.useRealTimers());

  it('creates a one-shot timer through the static receiver', () => {
    vi.useFakeTimers();
    const results: Array<number | 'complete'> = [];

    Observable[timer](10).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    vi.advanceTimersByTime(10);

    expect(results).toEqual([0, 'complete']);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses the receiver construction protocol and cancels interval work', () => {
    vi.useFakeTimers();
    class DerivedObservable<T> extends Observable<T> {}
    const controller = new AbortController();
    const results: number[] = [];
    const result = DerivedObservable[timer](5, 5);

    expect(result).toBeInstanceOf(DerivedObservable);
    result.subscribe((value) => results.push(value), { signal: controller.signal });
    vi.advanceTimersByTime(12);
    controller.abort();
    vi.advanceTimersByTime(20);

    expect(results).toEqual([0, 1]);
    expect(vi.getTimerCount()).toBe(0);
  });
});

for (const [name, ctor] of [
  ['platform', Observable],
  ['cold', ColdObservable],
] as const) {
  describe(`timer interval transition (${name})`, () => {
    afterEach(() => vi.useRealTimers());

    it.each([
      [0, 60],
      [5, 20],
      [20, 5],
    ])('preserves period after delay %i and interval %i', (delay, interval) => {
      vi.useFakeTimers();
      const controller = new AbortController();
      const values: number[] = [];
      ctor[timer](delay, interval).subscribe((value) => values.push(value), { signal: controller.signal });
      vi.advanceTimersByTime(delay);
      expect(values).toEqual([0]);
      vi.advanceTimersByTime(interval - 1);
      expect(values).toEqual([0]);
      vi.advanceTimersByTime(1);
      expect(values).toEqual([0, 1]);
      vi.advanceTimersByTime(interval);
      expect(values).toEqual([0, 1, 2]);
      controller.abort();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('does not start a repeating timer after cancellation in the first next', () => {
      vi.useFakeTimers();
      const controller = new AbortController();
      const values: number[] = [];
      ctor[timer](5, 20).subscribe(
        (value) => {
          values.push(value);
          controller.abort();
        },
        { signal: controller.signal }
      );
      vi.advanceTimersByTime(5);
      expect(values).toEqual([0]);
      expect(vi.getTimerCount()).toBe(0);
      vi.advanceTimersByTime(100);
      expect(values).toEqual([0]);
    });
  });
}

describe('timer shared lifecycle', () => {
  afterEach(() => vi.useRealTimers());

  it('continues after one observer aborts during the first notification', () => {
    vi.useFakeTimers();
    const first = new AbortController();
    const second = new AbortController();
    const values: number[] = [];
    const source = Observable[timer](5, 20);
    source.subscribe(() => first.abort(), { signal: first.signal });
    source.subscribe((value) => values.push(value), { signal: second.signal });
    vi.advanceTimersByTime(45);
    expect(values).toEqual([0, 1, 2]);
    expect(vi.getTimerCount()).toBe(1);
    second.abort();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('restarts a fresh sequence after cancellation at the interval transition', () => {
    vi.useFakeTimers();
    const first = new AbortController();
    const second = new AbortController();
    const source = Observable[timer](5, 20);
    const values: number[] = [];
    source.subscribe(() => first.abort(), { signal: first.signal });
    vi.advanceTimersByTime(5);
    source.subscribe((value) => values.push(value), { signal: second.signal });
    vi.advanceTimersByTime(25);
    expect(values).toEqual([0, 1]);
    expect(vi.getTimerCount()).toBe(1);
    second.abort();
    expect(vi.getTimerCount()).toBe(0);
  });
});
