import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { retryWhen } from './retry-when.js';

describe('retryWhen', () => {
  it('installs only an exact unique Symbol method and preserves the source type', () => {
    const retried = Observable.from([1])[retryWhen]((errors) => errors);
    const otherKey = Symbol('retryWhen');
    type HasStringNamedRetryWhen = 'retryWhen' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(retried).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedRetryWhen>().toEqualTypeOf<false>();
    expect(retryWhen.description).toBe('retryWhen');
    expect(Symbol.keyFor(retryWhen)).toBeUndefined();
    expect('retryWhen' in Observable.prototype).toBe(false);
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A notifier must return an ObservableValue.
      Observable.from([1])[retryWhen](() => 1);
    }
  });

  it('creates one hot error stream and retries for each notifier value', () => {
    const source = controllable<number>();
    const errors: unknown[] = [];
    const values: number[] = [];
    const failure1 = new Error('first');
    const failure2 = new Error('second');
    let notifierCalls = 0;
    let errorStream: Observable<any> | undefined;

    source.observable[retryWhen]((notifications) => {
      notifierCalls++;
      errorStream = notifications;
      notifications.subscribe((error) => errors.push(error));
      return notifications;
    }).subscribe((value) => values.push(value));

    source.subscriber.next(1);
    source.subscriber.error(failure1);
    source.subscriber.next(2);

    const lateErrors: unknown[] = [];
    errorStream?.subscribe((error) => lateErrors.push(error));
    source.subscriber.error(failure2);
    source.subscriber.next(3);

    expect(notifierCalls).toBe(1);
    expect(source.subscriptions).toBe(3);
    expect(errors).toEqual([failure1, failure2]);
    expect(lateErrors).toEqual([failure2]);
    expect(values).toEqual([1, 2, 3]);
  });

  it('completes when the notifier completes and errors when it errors', () => {
    const completionSource = controllable<number>();
    const completionNotifier = controllable<void>();
    const completionEvents: Array<number | 'complete'> = [];

    completionSource.observable[retryWhen](() => completionNotifier.observable).subscribe({
      next: (value) => completionEvents.push(value),
      complete: () => completionEvents.push('complete'),
    });
    completionSource.subscriber.next(1);
    completionSource.subscriber.error(new Error('source failed'));
    completionNotifier.subscriber.complete();

    expect(completionEvents).toEqual([1, 'complete']);
    expect(completionSource.subscriptions).toBe(1);

    const errorSource = controllable<number>();
    const errorNotifier = controllable<void>();
    const notifierFailure = new Error('notifier failed');
    const errors: unknown[] = [];

    errorSource.observable[retryWhen](() => errorNotifier.observable).subscribe({
      error: (error) => errors.push(error),
    });
    errorSource.subscriber.error(new Error('source failed'));
    errorNotifier.subscriber.error(notifierFailure);

    expect(errors).toEqual([notifierFailure]);
    expect(errorSource.subscriptions).toBe(1);
  });

  it('forwards notifier factory and conversion failures', () => {
    const factorySource = controllable<number>();
    const factoryFailure = new Error('factory failed');
    const factoryErrors: unknown[] = [];

    factorySource.observable[retryWhen](() => {
      throw factoryFailure;
    }).subscribe({ error: (error) => factoryErrors.push(error) });
    factorySource.subscriber.error(new Error('source failed'));

    expect(factoryErrors).toEqual([factoryFailure]);

    const conversionSource = controllable<number>();
    const conversionErrors: unknown[] = [];

    conversionSource.observable[retryWhen](
      // Exercise runtime conversion failure independently of the public type guard.
      (() => null) as unknown as (errors: Observable<any>) => ObservableValue<any>
    ).subscribe({ error: (error) => conversionErrors.push(error) });
    conversionSource.subscriber.error(new Error('source failed'));

    expect(conversionErrors).toHaveLength(1);
    expect(conversionErrors[0]).toBeInstanceOf(TypeError);
  });

  it('passes through source completion without creating the notifier', () => {
    const notifier = vi.fn((errors: Observable<any>) => errors);
    const events: Array<number | 'complete'> = [];

    Observable.from([1, 2])
      [retryWhen](notifier)
      .subscribe({
        next: (value) => events.push(value),
        complete: () => events.push('complete'),
      });

    expect(events).toEqual([1, 2, 'complete']);
    expect(notifier).not.toHaveBeenCalled();
  });

  it('handles a source initializer failure through the notifier', () => {
    const failure = new Error('initializer failed');
    const errors: unknown[] = [];
    let attempts = 0;
    const source = new Observable<number>((subscriber) => {
      attempts++;
      if (attempts === 1) {
        throw failure;
      }
      subscriber.next(42);
      subscriber.complete();
    });

    source[retryWhen]((notifications) => {
      notifications.subscribe((error) => errors.push(error));
      return notifications;
    }).subscribe((value) => errors.push(value));

    expect(attempts).toBe(2);
    expect(errors).toEqual([failure, 42]);
  });

  it('finalizes every synchronous attempt before retrying without growing the stack', () => {
    const attemptLimit = 2_000;
    const order: string[] = [];
    let attempts = 0;
    const source = new Observable<number>((subscriber) => {
      attempts++;
      const attempt = attempts;
      subscriber.addTeardown(() => {
        if (attempt <= 2 || attempt === attemptLimit) {
          order.push(`teardown ${attempt}`);
        }
      });

      if (attempt < attemptLimit) {
        if (attempt <= 2) {
          order.push(`error ${attempt}`);
        }
        subscriber.error(attempt);
      } else {
        subscriber.next(attempt);
        subscriber.complete();
      }
    });
    const values: number[] = [];

    source[retryWhen]((errors) => errors).subscribe((value) => values.push(value));

    expect(attempts).toBe(attemptLimit);
    expect(values).toEqual([attemptLimit]);
    expect(order).toEqual(['error 1', 'teardown 1', 'error 2', 'teardown 2', `teardown ${attemptLimit}`]);
  });

  it('cancels active source and notifier work when the final observer leaves', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const controller = new AbortController();

    source.observable[retryWhen](() => notifier.observable).subscribe(() => {}, { signal: controller.signal });
    source.subscriber.error(new Error('first attempt'));
    notifier.subscriber.next(undefined);

    expect(source.subscriber.active).toBe(true);
    expect(notifier.subscriber.active).toBe(true);

    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(notifier.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(2);
    expect(notifier.teardowns).toBe(1);
  });

  it('shares and ref-counts one activation, then restarts with fresh notifier state', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    let notifierCalls = 0;
    const retried = source.observable[retryWhen](() => {
      notifierCalls++;
      return notifier.observable;
    });

    retried.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    retried.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscriber.next(1);
    source.subscriber.error(new Error('first activation'));
    notifier.subscriber.next(undefined);
    source.subscriber.next(2);

    expect(source.subscriptions).toBe(2);
    expect(notifier.subscriptions).toBe(1);
    expect(notifierCalls).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([1, 2]);

    firstController.abort();
    source.subscriber.next(3);

    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([1, 2, 3]);
    expect(source.subscriber.active).toBe(true);

    secondController.abort();

    expect(source.subscriber.active).toBe(false);
    expect(notifier.subscriber.active).toBe(false);

    const restartedValues: number[] = [];
    retried.subscribe((value) => restartedValues.push(value));
    source.subscriber.next(4);
    source.subscriber.error(new Error('second activation'));

    expect(source.subscriptions).toBe(3);
    expect(notifier.subscriptions).toBe(2);
    expect(notifierCalls).toBe(2);
    expect(restartedValues).toEqual([4]);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    subscriptions++;
    sourceSubscriber = subscriber;
    subscriber.addTeardown(() => {
      teardowns++;
    });
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
    get teardowns() {
      return teardowns;
    },
  };
}
