import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type DelayWhenSymbol = typeof import('./delay-when.js').delayWhen;

let delayWhen: DelayWhenSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'delayWhen' in Observable.prototype;
  ({ delayWhen } = await import('./delay-when.js'));
});

describe('delayWhen', () => {
  it('installs only its exact unique Symbol and preserves the RxJS 7 selector types', () => {
    const source = Observable.from([1, 2]);
    const gate = Observable.from(['start']);
    const delayed = source[delayWhen]((value, index) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return Promise.resolve(value);
    }, gate);
    const otherKey = Symbol('delayWhen');
    type HasStringNamedDelayWhen = 'delayWhen' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(delayed).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedDelayWhen>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('delayWhen' in Observable.prototype).toBe(false);
    expect(delayWhen.description).toBe('delayWhen');
    expect(Symbol.keyFor(delayWhen)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A duration selector is required.
      source[delayWhen]();
      // @ts-expect-error A duration selector must return an ObservableValue.
      source[delayWhen](() => 1);
      // @ts-expect-error The optional subscription delay is an Observable in RxJS 7.
      source[delayWhen](() => [], Promise.resolve());
    }
  });

  it('releases overlapping values independently on each duration first value', () => {
    const source = controllable<string>();
    const firstDuration = controllable<void>();
    const secondDuration = controllable<void>();
    const durations = [firstDuration.observable, secondDuration.observable];
    const events: Array<string | 'complete'> = [];

    source.observable[delayWhen](() => durations.shift()!).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next('first');
    source.subscriber.next('second');
    source.subscriber.complete();

    expect(events).toEqual([]);

    secondDuration.subscriber.next(undefined);
    secondDuration.subscriber.next(undefined);
    firstDuration.subscriber.next(undefined);

    expect(events).toEqual(['second', 'first', 'complete']);
    expect(firstDuration.subscriber.active).toBe(false);
    expect(secondDuration.subscriber.active).toBe(false);
  });

  it('uses zero-based indices and swallows values whose duration completes empty', () => {
    const indices: number[] = [];
    const events: Array<number | 'complete'> = [];

    Observable.from([1, 2, 3])
      [delayWhen]((value, index) => {
        indices.push(index);
        return value === 2 ? [undefined] : [];
      })
      .subscribe({
        next: (value) => events.push(value),
        complete: () => events.push('complete'),
      });

    expect(indices).toEqual([0, 1, 2]);
    expect(events).toEqual([2, 'complete']);
  });

  it('keeps the result open after source completion until every duration settles', () => {
    const source = controllable<number>();
    const duration = controllable<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[delayWhen](() => duration.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.complete();

    expect(events).toEqual([]);
    expect(duration.subscriber.active).toBe(true);

    duration.subscriber.complete();

    expect(events).toEqual(['complete']);
  });

  it('forwards selector and duration-conversion errors and cancels the source', () => {
    const selectorFailure = new Error('selector failed');
    const selectorSource = controllable<number>();
    const selectorErrors: unknown[] = [];

    selectorSource.observable[delayWhen](() => {
      throw selectorFailure;
    }).subscribe({ error: (error) => selectorErrors.push(error) });
    selectorSource.subscriber.next(1);

    const conversionSource = controllable<number>();
    const conversionErrors: unknown[] = [];

    conversionSource.observable[delayWhen](() => ({} as ObservableValue<never>)).subscribe({
      error: (error) => conversionErrors.push(error),
    });
    conversionSource.subscriber.next(1);

    expect(selectorErrors).toEqual([selectorFailure]);
    expect(selectorSource.subscriber.active).toBe(false);
    expect(conversionErrors[0]).toBeInstanceOf(TypeError);
    expect(conversionSource.subscriber.active).toBe(false);
  });

  it('forwards a duration error and cancels the source and sibling durations', () => {
    const failure = new Error('duration failed');
    const source = controllable<number>();
    const firstDuration = controllable<void>();
    const secondDuration = controllable<void>();
    const durations = [firstDuration.observable, secondDuration.observable];
    const errors: unknown[] = [];

    source.observable[delayWhen](() => durations.shift()!).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    source.subscriber.next(2);
    secondDuration.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
    expect(firstDuration.subscriber.active).toBe(false);
  });

  it('forwards a source error and cancels every pending duration', () => {
    const failure = new Error('source failed');
    const source = controllable<number>();
    const duration = controllable<void>();
    const errors: unknown[] = [];

    source.observable[delayWhen](() => duration.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    source.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(duration.subscriber.active).toBe(false);
  });

  it('starts the source on the subscription delay first value or empty completion', () => {
    const nextGate = controllable<void>();
    const nextSource = tracked<number>();
    const nextResult = nextSource.observable[delayWhen](() => [undefined], nextGate.observable);
    const nextValues: number[] = [];

    nextResult.subscribe((value) => nextValues.push(value));
    expect(nextSource.activations).toBe(0);

    nextGate.subscriber.next(undefined);
    expect(nextSource.activations).toBe(1);
    expect(nextGate.subscriber.active).toBe(false);

    nextSource.subscribers[0]!.next(1);
    nextGate.subscriber.next(undefined);
    expect(nextSource.activations).toBe(1);
    expect(nextValues).toEqual([1]);

    const completionGate = controllable<void>();
    const completionSource = tracked<number>();

    completionSource.observable[delayWhen](() => [undefined], completionGate.observable).subscribe(() => {});
    completionGate.subscriber.complete();

    expect(completionSource.activations).toBe(1);
  });

  it('forwards subscription delay errors without activating the source', () => {
    const failure = new Error('subscription delay failed');
    const gate = controllable<void>();
    const source = tracked<number>();
    const errors: unknown[] = [];

    source.observable[delayWhen](() => [undefined], gate.observable).subscribe({
      error: (error) => errors.push(error),
    });
    gate.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.activations).toBe(0);
  });

  it('preserves synchronous reentrancy and handles a large synchronous source without stack growth', () => {
    const source = controllable<number>();
    const reentrantValues: number[] = [];

    source.observable[delayWhen]((value) => {
      if (value === 1) {
        source.subscriber.next(2);
      }
      return [undefined];
    }).subscribe((value) => reentrantValues.push(value));
    source.subscriber.next(1);

    expect(reentrantValues).toEqual([2, 1]);

    const count = 20_000;
    const values: number[] = [];

    Observable.from(Array.from({ length: count }, (_, index) => index))
      [delayWhen](() => [undefined])
      .subscribe((value) => values.push(value));

    expect(values).toHaveLength(count);
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBe(count - 1);
  });

  it('cancels the source, subscription delay, and every duration when the final observer leaves', () => {
    const source = controllable<0 | 1>();
    const gate = controllable<void>();
    const durations = [controllable<void>(), controllable<void>()] as const;
    const controller = new AbortController();

    source.observable[delayWhen]((value) => durations[value].observable, gate.observable).subscribe(() => {}, {
      signal: controller.signal,
    });
    gate.subscriber.next(undefined);
    source.subscriber.next(0);
    source.subscriber.next(1);
    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(gate.subscriber.active).toBe(false);
    expect(durations[0].subscriber.active).toBe(false);
    expect(durations[1].subscriber.active).toBe(false);
  });

  it('shares and ref-counts one activation, then restarts with fresh gate, index, and duration state', () => {
    const source = tracked<number>();
    const gate = tracked<void>();
    const durations: Array<ReturnType<typeof tracked<void>>> = [];
    const indices: number[] = [];
    const result = source.observable[delayWhen]((value, index) => {
      indices.push(index);
      const duration = tracked<void>();
      durations.push(duration);
      return duration.observable;
    }, gate.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(gate.activations).toBe(1);
    gate.subscribers[0]!.next(undefined);
    source.subscribers[0]!.next(1);
    expect(source.activations).toBe(1);
    expect(durations[0]!.activations).toBe(1);

    firstController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    expect(durations[0]!.subscribers[0]!.active).toBe(true);

    durations[0]!.subscribers[0]!.next(undefined);
    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([1]);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    expect(gate.activations).toBe(2);
    gate.subscribers[1]!.complete();
    source.subscribers[1]!.next(2);
    durations[1]!.subscribers[0]!.next(undefined);

    expect(source.activations).toBe(2);
    expect(indices).toEqual([0, 0]);
    expect(restartedValues).toEqual([2]);

    restartController.abort();
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly activations: number;
} {
  let subscriber: Subscriber<T> | undefined;
  let activations = 0;
  const observable = new Observable<T>((activeSubscriber) => {
    activations++;
    subscriber = activeSubscriber;
  });

  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('The controllable Observable is not active.');
      }
      return subscriber;
    },
    get activations() {
      return activations;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
} {
  const subscribers: Subscriber<T>[] = [];
  const observable = new Observable<T>((subscriber) => {
    subscribers.push(subscriber);
  });

  return {
    observable,
    subscribers,
    get activations() {
      return subscribers.length;
    },
  };
}
