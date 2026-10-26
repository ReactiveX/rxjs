import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { merge } from './merge.js';

describe('merge', () => {
  it('waits for an input whose conversion completes another active input', () => {
    const first = controllable<number>();
    const events: Array<number | 'complete'> = [];
    const second = {
      get [Symbol.iterator]() {
        first.subscriber.complete();
        return function* () {
          yield 2;
        };
      },
    };

    Observable[merge]([first.observable, second]).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([2, 'complete']);
  });

  it('reserves an input before reading it from the source array', () => {
    const first = controllable<number>();
    const events: Array<number | 'complete'> = [];
    const sources: ObservableValue<number>[] = [first.observable, []];
    Object.defineProperty(sources, 1, {
      get() {
        first.subscriber.complete();
        return [2];
      },
    });

    Observable[merge](sources).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([2, 'complete']);
  });

  it('preserves the concurrency limit while an input is being converted', () => {
    const first = controllable<number>();
    const third = controllable<number>();
    const fourth = controllable<number>();
    const events: Array<number | 'complete'> = [];
    let fourthStartedDuringConversion = false;
    const second = {
      get [Symbol.iterator]() {
        first.subscriber.complete();
        fourthStartedDuringConversion ||= fourth.subscriptions > 0;
        return function* () {
          yield 2;
        };
      },
    };

    Observable[merge]([first.observable, second, third.observable, fourth.observable], { concurrency: 2 }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(fourthStartedDuringConversion).toBe(false);
    expect(third.subscriptions).toBe(1);
    expect(fourth.subscriptions).toBe(1);
    expect(events).toEqual([2]);

    third.subscriber.next(3);
    third.subscriber.complete();
    fourth.subscriber.next(4);
    fourth.subscriber.complete();
    expect(events).toEqual([2, 3, 4, 'complete']);
  });

  it('cancels active inputs and leaves later inputs untouched when conversion throws', () => {
    const first = controllable<number>();
    const later = controllable<number>();
    const failure = new Error('conversion failed');
    const errors: unknown[] = [];
    let completed = false;
    const failing = {
      get [Symbol.iterator](): () => Iterator<number> {
        throw failure;
      },
    };

    Observable[merge]([first.observable, failing, later.observable]).subscribe({
      error: (error) => errors.push(error),
      complete: () => (completed = true),
    });

    expect(errors).toEqual([failure]);
    expect(completed).toBe(false);
    expect(first.subscriber.active).toBe(false);
    expect(later.subscriptions).toBe(0);
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
