import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { retry } from './retry.js';

describe('retry', () => {
  it('waits for a notifier value, closes that notifier, and then retries', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const values: number[] = [];
    const retried = source.observable[retry]({
      delay: () => notifier.observable,
      resetOnSuccess: false,
    });

    retried.subscribe((value) => values.push(value));
    source.subscriber.next(1);
    source.subscriber.error(new Error('first attempt'));

    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriber.active).toBe(true);

    notifier.subscriber.next(undefined);

    expect(notifier.subscriber.active).toBe(false);
    expect(source.subscriptions).toBe(2);

    source.subscriber.next(2);

    expect(values).toEqual([1, 2]);
  });

  it('passes consecutive retry counts to the delay selector when count is infinite', () => {
    const source = controllable<number>();
    const notifiers = [controllable<void>(), controllable<void>()];
    const retryCounts: number[] = [];
    const retried = source.observable[retry]({
      delay: (_error, retryCount) => {
        retryCounts.push(retryCount);
        return notifiers[retryCount - 1]!.observable;
      },
      resetOnSuccess: false,
    });

    retried.subscribe(() => {});
    source.subscriber.error(new Error('first attempt'));
    notifiers[0]!.subscriber.next(undefined);
    source.subscriber.error(new Error('second attempt'));

    expect(retryCounts).toEqual([1, 2]);
    expect(notifiers[1]!.subscriber.active).toBe(true);
  });

  it('resets the delay-selector count after a successful source value', () => {
    const source = controllable<number>();
    const firstNotifier = controllable<void>();
    const secondNotifier = controllable<void>();
    const notifiers = [firstNotifier.observable, secondNotifier.observable];
    const retryCounts: number[] = [];

    source.observable[retry]({
      delay: (_error, retryCount) => {
        retryCounts.push(retryCount);
        return notifiers.shift()!;
      },
    }).subscribe(() => {});

    source.subscriber.error(new Error('first attempt'));
    firstNotifier.subscriber.next(undefined);
    source.subscriber.next(1);
    source.subscriber.error(new Error('second attempt'));

    expect(retryCounts).toEqual([1, 1]);
    expect(secondNotifier.subscriber.active).toBe(true);
  });

  it('completes without retrying when the notifier completes', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[retry]({ delay: () => notifier.observable }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.error(new Error('source failed'));
    notifier.subscriber.complete();

    expect(events).toEqual([1, 'complete']);
    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriber.active).toBe(false);
  });

  it('forwards notifier errors without retrying', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const failure = new Error('notifier failed');
    const errors: unknown[] = [];

    source.observable[retry]({ delay: () => notifier.observable }).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.error(new Error('source failed'));
    notifier.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriber.active).toBe(false);
  });

  it('forwards a delay-selector throw without subscribing to a notifier', () => {
    const source = controllable<number>();
    const failure = new Error('selector failed');
    const errors: unknown[] = [];

    source.observable[retry]({
      delay: () => {
        throw failure;
      },
    }).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.error(new Error('source failed'));

    expect(errors).toEqual([failure]);
    expect(source.subscriptions).toBe(1);
  });

  it('shares source and notifier work until the final observer leaves', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const retried = source.observable[retry]({
      delay: () => notifier.observable,
      resetOnSuccess: false,
    });

    retried.subscribe(() => {}, { signal: firstController.signal });
    retried.subscribe(() => {}, { signal: secondController.signal });
    source.subscriber.error(new Error('source failed'));

    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriptions).toBe(1);

    firstController.abort();
    expect(notifier.subscriber.active).toBe(true);

    secondController.abort();
    expect(notifier.subscriber.active).toBe(false);
  });

  it('cancels active source work when the result loses its final observer', () => {
    const source = controllable<number>();
    const resultController = new AbortController();

    source.observable[retry]().subscribe(() => {}, {
      signal: resultController.signal,
    });

    expect(source.subscriber.active).toBe(true);

    resultController.abort();

    expect(source.subscriber.active).toBe(false);
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
