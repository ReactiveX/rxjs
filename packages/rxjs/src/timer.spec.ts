import { afterEach, describe, expect, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { timer } from './timer.js';

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
