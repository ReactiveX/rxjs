import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { debounce } from './debounce.js';
import { ColdObservable } from './cold-observable.js';

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

    second.subscriber.next(undefined);

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

describe.each([
  ['platform', Observable],
  ['cold', ColdObservable],
] as const)('debounce with reentrant duration teardown (%s)', (_name, ObservableCtor) => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves the emitted value when teardown starts a new duration', () => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const second = controllable<void>();
    const values: string[] = [];

    source.observable[debounce]((value) => (value === 'first' ? first.observable : second.observable)).subscribe((value) =>
      values.push(value)
    );
    source.subscriber.next('first');
    first.subscriber.addTeardown(() => source.subscriber.next('second'));
    first.subscriber.next(undefined);

    expect(values).toEqual(['first']);
    expect(first.subscriber.active).toBe(false);
    expect(second.subscriber.active).toBe(true);

    second.subscriber.next(undefined);
    expect(values).toEqual(['first', 'second']);
    expect(second.subscriber.active).toBe(false);
    source.subscriber.complete();
  });

  it('retains ownership of a replacement timer created during teardown', () => {
    vi.useFakeTimers();
    const source = controllable<string>(ObservableCtor);
    const values: string[] = [];

    source.observable[debounce](
      (value) =>
        new Observable<void>((subscriber) => {
          const id = setTimeout(() => subscriber.next(undefined), 10);
          subscriber.addTeardown(() => {
            clearTimeout(id);
            if (value === 'first') {
              source.subscriber.next('second');
            }
          });
        })
    ).subscribe((value) => values.push(value));

    source.subscriber.next('first');
    vi.advanceTimersByTime(10);
    expect(vi.getTimerCount()).toBe(1);

    source.subscriber.next('third');
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(10);

    expect(values).toEqual(['first', 'third']);
    expect(vi.getTimerCount()).toBe(0);
    source.subscriber.complete();
  });

  it('delivers the pending value before a completion triggered by teardown', () => {
    const source = controllable<string>(ObservableCtor);
    const duration = controllable<void>();
    const events: string[] = [];

    source.observable[debounce](() => duration.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next('first');
    duration.subscriber.addTeardown(() => source.subscriber.complete());
    duration.subscriber.next(undefined);

    expect(events).toEqual(['first', 'complete']);
    expect(source.subscriber.active).toBe(false);
    expect(duration.subscriber.active).toBe(false);
  });

  it.each(['cancel', 'error'] as const)('discards the pending value when teardown causes %s', (terminal) => {
    const source = controllable<string>(ObservableCtor);
    const duration = controllable<void>();
    const controller = new AbortController();
    const events: string[] = [];
    const errors: unknown[] = [];
    const failure = new Error('source failed');

    source.observable[debounce](() => duration.observable).subscribe(
      {
        next: (value) => events.push(value),
        complete: () => events.push('complete'),
        error: (error) => errors.push(error),
      },
      { signal: controller.signal }
    );
    source.subscriber.next('first');
    duration.subscriber.addTeardown(() => (terminal === 'cancel' ? controller.abort() : source.subscriber.error(failure)));
    duration.subscriber.next(undefined);

    expect(events).toEqual([]);
    expect(errors).toEqual(terminal === 'error' ? [failure] : []);
    expect(source.subscriber.active).toBe(false);
    expect(duration.subscriber.active).toBe(false);
  });

  it('keeps a new value pending when it arrives from the downstream observer', () => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const second = controllable<void>();
    const values: string[] = [];

    source.observable[debounce]((value) => (value === 'first' ? first.observable : second.observable)).subscribe((value) => {
      values.push(value);
      if (value === 'first') {
        source.subscriber.next('second');
      }
    });
    source.subscriber.next('first');
    first.subscriber.next(undefined);

    expect(values).toEqual(['first']);
    expect(second.subscriber.active).toBe(true);
    second.subscriber.next(undefined);
    expect(values).toEqual(['first', 'second']);
    source.subscriber.complete();
  });

  it('preserves nested synchronous notification order before completing', () => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const events: string[] = [];

    source.observable[debounce]((value) => (value === 'first' ? first.observable : [undefined])).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next('first');
    first.subscriber.addTeardown(() => {
      source.subscriber.next('second');
      source.subscriber.complete();
    });
    first.subscriber.next(undefined);

    expect(events).toEqual(['second', 'first', 'complete']);
  });

  it('completes synchronously when the downstream observer completes the source', () => {
    const source = controllable<string>(ObservableCtor);
    const duration = controllable<void>();
    const events: string[] = [];

    source.observable[debounce](() => duration.observable).subscribe({
      next: (value) => {
        events.push(`start ${value}`);
        source.subscriber.complete();
        events.push(`end ${value}`);
      },
      complete: () => events.push('complete'),
    });
    source.subscriber.next('first');
    duration.subscriber.next(undefined);

    expect(events).toEqual(['start first', 'complete', 'end first']);
  });

  it.each(['next', 'error'] as const)('ignores a stale %s from a shared duration notification', (notification) => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const second = controllable<void>();
    const observerController = new AbortController();
    const values: string[] = [];
    const errors: unknown[] = [];

    first.observable.subscribe(
      {
        next: () => source.subscriber.next('second'),
        error: () => source.subscriber.next('second'),
      },
      { signal: observerController.signal }
    );
    source.observable[debounce]((value) => (value === 'first' ? first.observable : second.observable)).subscribe({
      next: (value) => values.push(value),
      error: (error) => errors.push(error),
    });
    source.subscriber.next('first');
    if (notification === 'next') {
      first.subscriber.next(undefined);
    } else {
      first.subscriber.error(new Error('obsolete duration'));
    }

    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(second.subscriber.active).toBe(true);
    second.subscriber.next(undefined);
    expect(values).toEqual(['second']);
    source.subscriber.complete();
    observerController.abort();
  });

  it('emits values for synchronous durations and completes once', () => {
    const source = controllable<string>(ObservableCtor);
    const events: string[] = [];

    source.observable[debounce](() => [undefined]).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next('first');
    source.subscriber.next('second');
    source.subscriber.complete();

    expect(events).toEqual(['first', 'second', 'complete']);
  });

  it('emits only the latest value for asynchronous durations', async () => {
    const source = controllable<string>(ObservableCtor);
    const values: string[] = [];

    source.observable[debounce](() => Promise.resolve()).subscribe((value) => values.push(value));
    source.subscriber.next('first');
    source.subscriber.next('second');
    expect(values).toEqual([]);

    await Promise.resolve();
    expect(values).toEqual(['second']);
    source.subscriber.complete();
  });

  it('keeps the newest duration when replacing a duration reenters the source', () => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const second = controllable<void>();
    const third = controllable<void>();
    const durations = { first, second, third };
    const projections: Array<[string, number]> = [];
    const values: string[] = [];

    source.observable[debounce]((value, index) => {
      projections.push([value, index]);
      return durations[value as keyof typeof durations].observable;
    }).subscribe((value) => values.push(value));
    source.subscriber.next('first');
    first.subscriber.addTeardown(() => source.subscriber.next('third'));
    source.subscriber.next('second');

    expect(projections).toEqual([
      ['first', 0],
      ['third', 1],
    ]);
    expect(first.subscriber.active).toBe(false);
    expect(second.subscriptions).toBe(0);
    expect(third.subscriber.active).toBe(true);
    expect(values).toEqual([]);

    third.subscriber.next(undefined);
    expect(values).toEqual(['third']);
    source.subscriber.complete();
  });

  it.each(['complete', 'cancel'] as const)('does not select another duration after teardown calls %s', (terminal) => {
    const source = controllable<string>(ObservableCtor);
    const first = controllable<void>();
    const second = controllable<void>();
    const controller = new AbortController();
    const projections: string[] = [];
    const events: string[] = [];

    source.observable[debounce]((value) => {
      projections.push(value);
      return value === 'first' ? first.observable : second.observable;
    }).subscribe(
      {
        next: (value) => events.push(value),
        complete: () => events.push('complete'),
      },
      { signal: controller.signal }
    );
    source.subscriber.next('first');
    first.subscriber.addTeardown(() => (terminal === 'complete' ? source.subscriber.complete() : controller.abort()));
    source.subscriber.next('second');

    expect(projections).toEqual(['first']);
    expect(second.subscriptions).toBe(0);
    expect(events).toEqual(terminal === 'complete' ? ['second', 'complete'] : []);
    expect(source.subscriber.active).toBe(false);
  });

  it('does not convert a duration superseded inside the selector', () => {
    const source = controllable<string>(ObservableCtor);
    const second = controllable<void>();
    const values: string[] = [];
    let conversions = 0;
    const obsoleteDuration = {
      get [Symbol.iterator]() {
        conversions++;
        return function* () {
          yield undefined;
        };
      },
    };

    source.observable[debounce]((value) => {
      if (value === 'first') {
        source.subscriber.next('second');
        return obsoleteDuration;
      }
      return second.observable;
    }).subscribe((value) => values.push(value));
    source.subscriber.next('first');

    expect(conversions).toBe(0);
    expect(values).toEqual([]);
    expect(second.subscriber.active).toBe(true);
    second.subscriber.next(undefined);
    expect(values).toEqual(['second']);
    source.subscriber.complete();
  });

  it('does not activate a duration superseded during input conversion', () => {
    const source = controllable<string>(ObservableCtor);
    const second = controllable<void>();
    const values: string[] = [];
    let iterations = 0;
    let converted = false;
    const obsoleteDuration = {
      get [Symbol.iterator]() {
        if (!converted) {
          converted = true;
          source.subscriber.next('second');
        }
        return function* () {
          iterations++;
          yield undefined;
        };
      },
    };

    source.observable[debounce]((value) => (value === 'first' ? obsoleteDuration : second.observable)).subscribe((value) =>
      values.push(value)
    );
    source.subscriber.next('first');

    expect(iterations).toBe(0);
    expect(values).toEqual([]);
    expect(second.subscriber.active).toBe(true);
    second.subscriber.next(undefined);
    expect(values).toEqual(['second']);
    source.subscriber.complete();
  });

  it.each(['selector', 'conversion'] as const)('ignores a superseded %s failure', (phase) => {
    const source = controllable<string>(ObservableCtor);
    const second = controllable<void>();
    const values: string[] = [];
    const errors: unknown[] = [];
    const failure = new Error('obsolete duration');
    const fail = () => {
      source.subscriber.next('second');
      throw failure;
    };
    const obsoleteDuration = {
      get [Symbol.iterator](): () => Iterator<void> {
        return fail();
      },
    };

    source.observable[debounce]((value) => {
      if (value === 'first') {
        return phase === 'selector' ? fail() : obsoleteDuration;
      }
      return second.observable;
    }).subscribe({
      next: (value) => values.push(value),
      error: (error) => errors.push(error),
    });
    source.subscriber.next('first');

    expect(errors).toEqual([]);
    expect(second.subscriber.active).toBe(true);
    second.subscriber.next(undefined);
    expect(values).toEqual(['second']);
    source.subscriber.complete();
  });

  it.each(['selector', 'conversion'] as const)('forwards an active %s failure', (phase) => {
    const source = controllable<string>(ObservableCtor);
    const errors: unknown[] = [];
    const failure = new Error('active duration');
    const fail = () => {
      throw failure;
    };

    source.observable[debounce](() => {
      if (phase === 'selector') {
        return fail();
      }
      return {
        get [Symbol.iterator](): () => Iterator<void> {
          return fail();
        },
      };
    }).subscribe({ error: (error) => errors.push(error) });
    source.subscriber.next('first');

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
  });
});

describe('debounce with a numeric delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes a pending value immediately when the source completes', () => {
    const source = controllable<number>();
    const events: Array<number | 'complete'> = [];

    source.observable[debounce](10).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);

    expect(events).toEqual([]);
    expect(vi.getTimerCount()).toBe(1);

    source.subscriber.complete();

    expect(events).toEqual([1, 'complete']);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10);
    expect(events).toEqual([1, 'complete']);
  });

  it('resets one timer for repeated values and emits only the latest value', () => {
    const source = controllable<number>();
    const values: number[] = [];

    source.observable[debounce](5).subscribe((value) => values.push(value));
    source.subscriber.next(1);
    vi.advanceTimersByTime(4);
    source.subscriber.next(2);

    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(4);
    expect(values).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(values).toEqual([2]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shares one timer and cancels it only after the final observer leaves', () => {
    const source = controllable<number>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const debounced = source.observable[debounce](10);

    debounced.subscribe(() => {}, { signal: firstController.signal });
    debounced.subscribe(() => {}, { signal: secondController.signal });
    source.subscriber.next(1);

    expect(source.subscriptions).toBe(1);
    expect(vi.getTimerCount()).toBe(1);

    firstController.abort();
    expect(source.subscriber.active).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    secondController.abort();
    expect(source.subscriber.active).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});

function controllable<T>(ObservableCtor: typeof Observable = Observable): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  const observable = new ObservableCtor<T>((subscriber) => {
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
