import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { debounce } from './debounce.js';

describe('debounce', () => {
  it('cancels the prior selector and emits when the current selector emits', () => {
    const source = controllable<string>();
    const first = controllable<void>();
    const second = controllable<void>();
    const selectors = [first.observable, second.observable];
    const values: string[] = [];

    source.observable[debounce](() => selectors.shift()!).subscribe((value) => values.push(value));
    source.subscriber.next('first');
    source.subscriber.next('second');

    expect(first.subscriber.active).toBe(false);
    expect(second.subscriber.active).toBe(true);

    second.subscriber.next();

    expect(values).toEqual(['second']);
    expect(second.subscriber.active).toBe(false);
  });

  it('keeps a value pending when its selector completes without emitting', () => {
    const source = controllable<number>();
    const selector = controllable<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[debounce](() => selector.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    selector.subscriber.complete();

    expect(events).toEqual([]);

    source.subscriber.complete();

    expect(events).toEqual([1, 'complete']);
  });

  it('flushes a pending value and cancels a never selector when the source completes', () => {
    const source = controllable<number>();
    const selector = controllable<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[debounce](() => selector.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.complete();

    expect(events).toEqual([1, 'complete']);
    expect(selector.subscriber.active).toBe(false);
  });

  it('forwards selector errors and closes the source', () => {
    const source = controllable<number>();
    const selector = controllable<void>();
    const failure = new Error('selector failed');
    const errors: unknown[] = [];

    source.observable[debounce](() => selector.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    selector.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
  });

  it('shares one source and selector activation until the final observer leaves', () => {
    const source = controllable<number>();
    const selector = controllable<void>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const debounced = source.observable[debounce](() => selector.observable);

    debounced.subscribe(() => {}, { signal: firstController.signal });
    debounced.subscribe(() => {}, { signal: secondController.signal });
    source.subscriber.next(1);

    expect(source.subscriptions).toBe(1);
    expect(selector.subscriptions).toBe(1);

    firstController.abort();
    expect(source.subscriber.active).toBe(true);
    expect(selector.subscriber.active).toBe(true);

    secondController.abort();
    expect(source.subscriber.active).toBe(false);
    expect(selector.subscriber.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
} {
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
