import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { sample } from './sample.js';
import { Subject } from './subject.js';

describe('sample', () => {
  it('exports an exact unique Symbol without adding a string method', () => {
    expect(typeof sample).toBe('symbol');
    expect(sample).not.toBe(Symbol('sample'));
    expect(Object.hasOwn(Observable.prototype, 'sample')).toBe(false);
    expectTypeOf(new Observable<number>(() => {})[sample]).toBeFunction();
  });

  it('emits the latest source value once for each notification period', () => {
    const source = new Subject<number>();
    const notifier = new Subject<void>();
    const values: number[] = [];

    source[sample](notifier).subscribe((value) => values.push(value));
    notifier.next();
    source.next(1);
    source.next(2);
    notifier.next();
    notifier.next();
    source.next(3);
    notifier.next();

    expect(values).toEqual([2, 3]);
  });

  it('does not emit or complete when the notifier completes', () => {
    const source = new Subject<number>();
    const notifier = new Subject<void>();
    const values: number[] = [];
    let completed = false;

    source[sample](notifier).subscribe({
      next: (value) => values.push(value),
      complete: () => {
        completed = true;
      },
    });
    source.next(1);
    notifier.complete();
    source.next(2);

    expect(values).toEqual([]);
    expect(completed).toBe(false);

    source.complete();
    expect(completed).toBe(true);
  });

  it('works when the notifier and source are the same observable', () => {
    const source = new Subject<number>();
    const values: number[] = [];

    source[sample](source).subscribe((value) => values.push(value));
    source.next(1);
    source.next(2);
    source.next(3);

    expect(values).toEqual([1, 2, 3]);
  });

  it('forwards source and notifier errors', () => {
    const sourceFailure = new Error('source failed');
    const notifierFailure = new Error('notifier failed');
    const source = new Subject<number>();
    const notifier = new Subject<void>();
    const sourceErrors: unknown[] = [];
    const notifierErrors: unknown[] = [];

    source[sample](notifier).subscribe({ error: (error) => sourceErrors.push(error) });
    source.error(sourceFailure);

    const secondSource = new Subject<number>();
    const secondNotifier = new Subject<void>();
    secondSource[sample](secondNotifier).subscribe({ error: (error) => notifierErrors.push(error) });
    secondNotifier.error(notifierFailure);

    expect(sourceErrors).toEqual([sourceFailure]);
    expect(notifierErrors).toEqual([notifierFailure]);
  });

  it('cancels both inputs when the final observer leaves', () => {
    const source = new Subject<number>();
    const notifier = new Subject<void>();
    const sourceSubscribe = vi.spyOn(source, 'subscribe');
    const notifierSubscribe = vi.spyOn(notifier, 'subscribe');
    const firstController = new AbortController();
    const secondController = new AbortController();
    const sampled = source[sample](notifier);

    sampled.subscribe(() => {}, { signal: firstController.signal });
    sampled.subscribe(() => {}, { signal: secondController.signal });
    expect(sourceSubscribe).toHaveBeenCalledTimes(1);
    expect(notifierSubscribe).toHaveBeenCalledTimes(1);

    firstController.abort();
    expect(source.active).toBe(true);
    expect(notifier.active).toBe(true);

    secondController.abort();
    sampled.subscribe(() => {});
    expect(sourceSubscribe).toHaveBeenCalledTimes(2);
    expect(notifierSubscribe).toHaveBeenCalledTimes(2);
  });
});
