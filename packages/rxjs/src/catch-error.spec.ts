import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { catchError } from './catch-error.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('catchError', () => {
  it('replaces a failed source with any ObservableValue', () => {
    const failure = new Error('source failed');
    const observations: Array<number | string | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[catchError]((error) => {
      expect(error).toBe(failure);
      return ['a', 'b'];
    }).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([1, 'a', 'b', 'complete']);
  });

  it('passes the stable caught observable and resubscribes when it is returned', () => {
    const failure = new Error('retry');
    const caughtValues: Observable<number>[] = [];
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(sourceActivations);
      subscriber.error(failure);
    });
    const observations: Array<number | 'done'> = [];

    source[catchError]((error, caught) => {
      expect(error).toBe(failure);
      caughtValues.push(caught);
      return sourceActivations < 3 ? caught : (['done'] as const);
    }).subscribe((value) => observations.push(value));

    expect(sourceActivations).toBe(3);
    expect(caughtValues).toHaveLength(3);
    expect(new Set(caughtValues).size).toBe(1);
    expect(observations).toEqual([1, 2, 3, 'done']);
  });

  it('trampolines synchronous caught recursion', () => {
    const attempts = 1_000;
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.error(sourceActivations);
    });
    const observations: number[] = [];

    source[catchError]((_error, caught) => (sourceActivations < attempts ? caught : [42])).subscribe((value) =>
      observations.push(value)
    );

    expect(sourceActivations).toBe(attempts);
    expect(observations).toEqual([42]);
  });

  it('tears down the failed source before selecting and activating the replacement', () => {
    const order: string[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.addTeardown(() => order.push('source teardown'));
      order.push('source error');
      subscriber.error(new Error('failed'));
    });
    const replacement = new Observable<string>((subscriber) => {
      order.push('replacement activation');
      subscriber.next('recovered');
      subscriber.complete();
    });

    source[catchError](() => {
      order.push('selector');
      return replacement;
    }).subscribe();

    expect(order).toEqual(['source error', 'source teardown', 'selector', 'replacement activation']);
  });

  it('passes source completion through without invoking the selector', () => {
    const selector = vi.fn(() => ['replacement']);
    const observations: Array<number | string | 'complete'> = [];

    Observable.from([1, 2])
      [catchError](selector)
      .subscribe({
        next: (value) => observations.push(value),
        complete: () => observations.push('complete'),
      });

    expect(selector).not.toHaveBeenCalled();
    expect(observations).toEqual([1, 2, 'complete']);
  });

  it('catches errors thrown synchronously by the source initializer', () => {
    const failure = new Error('initializer failed');
    const errors: unknown[] = [];
    const observations: string[] = [];
    const source = new Observable<never>(() => {
      throw failure;
    });

    source[catchError]((error) => {
      errors.push(error);
      return ['recovered'];
    }).subscribe((value) => observations.push(value));

    expect(errors).toEqual([failure]);
    expect(observations).toEqual(['recovered']);
  });

  it('forwards selector errors', () => {
    const selectorFailure = new Error('selector failed');
    const errors: unknown[] = [];
    const source = new Observable<never>((subscriber) => subscriber.error(new Error('source failed')));

    source[catchError](() => {
      throw selectorFailure;
    }).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([selectorFailure]);
  });

  it('forwards synchronous replacement errors without catching them again', () => {
    const replacementFailure = new Error('replacement failed');
    const selector = vi.fn(
      () =>
        new Observable<never>(() => {
          throw replacementFailure;
        })
    );
    const errors: unknown[] = [];
    const source = new Observable<never>((subscriber) => subscriber.error(new Error('source failed')));

    source[catchError](selector).subscribe({ error: (error) => errors.push(error) });

    expect(selector).toHaveBeenCalledTimes(1);
    expect(errors).toEqual([replacementFailure]);
  });

  it('cancels replacement ownership with the result', () => {
    let replacementTeardowns = 0;
    const replacement = new Observable<string>((subscriber) => {
      subscriber.addTeardown(() => {
        replacementTeardowns++;
      });
    });
    const source = new Observable<never>((subscriber) => subscriber.error(new Error('source failed')));
    const controller = new AbortController();

    source[catchError](() => replacement).subscribe(() => {}, { signal: controller.signal });
    controller.abort();

    expect(replacementTeardowns).toBe(1);
  });

  it('does not invoke the selector after downstream cancellation', () => {
    const source = controllable<number>();
    const selector = vi.fn(() => ['replacement']);
    const controller = new AbortController();
    const reportError = vi.fn();
    const lateFailure = new Error('late failure');
    vi.stubGlobal('reportError', reportError);

    source.observable[catchError](selector).subscribe(() => {}, { signal: controller.signal });
    controller.abort();
    source.subscriber.error(lateFailure);

    expect(selector).not.toHaveBeenCalled();
    expect(source.teardowns).toBe(1);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(lateFailure);
  });

  it('shares source and replacement work, ref-counts cancellation, and restarts cleanly', () => {
    const failure = new Error('source failed');
    const source = controllable<number>();
    const replacement = controllable<string>();
    const recovered = source.observable[catchError](() => replacement.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: Array<number | string> = [];
    const secondValues: Array<number | string> = [];

    recovered.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    recovered.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscriber.next(1);
    source.subscriber.error(failure);
    replacement.subscriber.next('a');

    expect(source.subscriptions).toBe(1);
    expect(source.teardowns).toBe(1);
    expect(replacement.subscriptions).toBe(1);
    expect(firstValues).toEqual([1, 'a']);
    expect(secondValues).toEqual([1, 'a']);

    firstController.abort();
    replacement.subscriber.next('b');

    expect(firstValues).toEqual([1, 'a']);
    expect(secondValues).toEqual([1, 'a', 'b']);
    expect(replacement.teardowns).toBe(0);

    secondController.abort();

    expect(replacement.teardowns).toBe(1);

    const restartedValues: Array<number | string> = [];
    recovered.subscribe((value) => restartedValues.push(value));
    source.subscriber.next(2);

    expect(source.subscriptions).toBe(2);
    expect(restartedValues).toEqual([2]);
  });

  it('preserves result types and installs only an exact unique Symbol method', () => {
    const recovered = Observable.from([1])[catchError](() => ['recovered']);
    const unchanged = Observable.from([1])[catchError](() => {
      throw new Error('rethrow');
    });
    type HasStringNamedCatchError = 'catchError' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(recovered).toEqualTypeOf<Observable<number | string>>();
    expectTypeOf(unchanged).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedCatchError>().toEqualTypeOf<false>();
    expect(catchError.description).toBe('catchError');
    expect(Symbol.keyFor(catchError)).toBeUndefined();
    expect('catchError' in Observable.prototype).toBe(false);
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
