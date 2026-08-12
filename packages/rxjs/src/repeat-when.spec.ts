import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type RepeatWhenSymbol = typeof import('./repeat-when.js').repeatWhen;
type ColdObservableCtor = typeof import('./cold-observable.js').ColdObservable;

let repeatWhen: RepeatWhenSymbol;
let ColdObservable: ColdObservableCtor;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'repeatWhen' in Observable.prototype;
  ({ repeatWhen } = await import('./repeat-when.js'));
  ({ ColdObservable } = await import('./cold-observable.js'));
});

describe('repeatWhen', () => {
  it('installs only its exact unique Symbol and preserves the source type', () => {
    const source = Observable.from([1]);
    const repeated = source[repeatWhen]((completions) => {
      expectTypeOf(completions).toEqualTypeOf<Observable<void>>();
      return completions;
    });
    const promisedRepeat = source[repeatWhen](() => Promise.resolve('repeat'));
    const iterableRepeat = source[repeatWhen](() => new Set(['repeat']));
    const otherKey = Symbol('repeatWhen');
    type HasStringNamedRepeatWhen = Observable<number> extends { repeatWhen: unknown } ? true : false;

    expectTypeOf(repeated).toEqualTypeOf<Observable<number>>();
    expectTypeOf(promisedRepeat).toEqualTypeOf<Observable<number>>();
    expectTypeOf(iterableRepeat).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedRepeatWhen>().toEqualTypeOf<false>();
    expect(source[repeatWhen]).toBeTypeOf('function');
    expect(hadStringMethod).toBe(false);
    expect('repeatWhen' in Observable.prototype).toBe(false);
    expect(repeatWhen.description).toBe('repeatWhen');
    expect(Symbol.keyFor(repeatWhen)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('invokes the notifier factory once and exposes a hot completion stream for the activation', () => {
    const source = tracked<number>();
    const completionStreams: Observable<void>[] = [];
    const lateCompletions: void[] = [];
    const values: number[] = [];
    const controller = new AbortController();
    const repeated = source.observable[repeatWhen]((completions) => {
      completionStreams.push(completions);
      return completions;
    });

    repeated.subscribe((value) => values.push(value), { signal: controller.signal });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    completionStreams[0]!.subscribe((value) => lateCompletions.push(value), { signal: controller.signal });
    source.subscribers[1]!.next(2);
    source.subscribers[1]!.complete();

    expect(completionStreams).toHaveLength(1);
    expect(lateCompletions).toEqual([undefined]);
    expect(source.activations).toBe(3);
    expect(values).toEqual([1, 2]);

    controller.abort();
  });

  it('multicasts each completion when a cold-compatible result observes the completion stream twice', () => {
    let sourceActivations = 0;
    const values: number[] = [];
    const events: Array<number | 'complete'> = [];
    const source = new ColdObservable<number>((subscriber) => {
      subscriber.next(++sourceActivations);
      subscriber.complete();
    });

    source[repeatWhen](
      (completions) =>
        new Observable<void>((subscriber) => {
          let completionObservations = 0;
          const observeCompletion = () => {
            completionObservations++;
            if (completionObservations === 2) {
              subscriber.next(undefined);
            } else if (completionObservations === 4) {
              subscriber.complete();
            }
          };

          completions.subscribe(observeCompletion, { signal: subscriber.signal });
          completions.subscribe(observeCompletion, { signal: subscriber.signal });
        })
    ).subscribe({
      next: (value) => {
        values.push(value);
        events.push(value);
      },
      complete: () => events.push('complete'),
    });

    expect(sourceActivations).toBe(2);
    expect(values).toEqual([1, 2]);
    expect(events).toEqual([1, 2, 'complete']);
  });

  it('uses each notifier value to start the next source attempt', () => {
    const source = tracked<number>();
    const notifier = tracked<void>();
    const values: number[] = [];

    source.observable[repeatWhen](() => notifier.observable).subscribe((value) => values.push(value));
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    expect(notifier.activations).toBe(1);
    expect(source.activations).toBe(1);

    notifier.subscribers[0]!.next(undefined);
    source.subscribers[1]!.next(2);

    expect(source.activations).toBe(2);
    expect(values).toEqual([1, 2]);
  });

  it('completes after the notifier completes while repetition is pending', () => {
    const source = tracked<number>();
    const notifier = tracked<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[repeatWhen](() => notifier.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();
    notifier.subscribers[0]!.complete();

    expect(events).toEqual([1, 'complete']);
    expect(source.activations).toBe(1);
  });

  it('does not start a queued synchronous repeat after its notifier has already completed', () => {
    let sourceActivations = 0;
    const events: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(++sourceActivations);
      subscriber.complete();
    });

    source[repeatWhen](() => [undefined]).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(sourceActivations).toBe(1);
    expect(events).toEqual([1, 'complete']);
  });

  it('waits for an active repeated source to complete after the notifier completes', () => {
    const source = tracked<number>();
    const notifier = tracked<void>();
    const events: Array<number | 'complete'> = [];

    source.observable[repeatWhen](() => notifier.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscribers[0]!.complete();
    notifier.subscribers[0]!.next(undefined);
    notifier.subscribers[0]!.complete();
    source.subscribers[1]!.next(2);

    expect(events).toEqual([2]);

    source.subscribers[1]!.complete();

    expect(events).toEqual([2, 'complete']);
  });

  it('leaves the result pending when the notifier never emits', () => {
    const source = tracked<number>();
    const notifier = tracked<never>();
    const events: Array<number | 'complete'> = [];

    source.observable[repeatWhen](() => notifier.observable).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    expect(events).toEqual([1]);
    expect(source.activations).toBe(1);
    expect(notifier.subscribers[0]!.active).toBe(true);
  });

  it('forwards source errors without invoking the notifier factory', () => {
    const source = tracked<number>();
    const factory = vi.fn(() => Observable.from([]));
    const failure = new Error('source failed');
    const errors: unknown[] = [];

    source.observable[repeatWhen](factory).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscribers[0]!.error(failure);

    expect(errors).toEqual([failure]);
    expect(factory).not.toHaveBeenCalled();
  });

  it('forwards notifier errors and cancels an active repeated source', () => {
    const source = tracked<number>();
    const notifier = tracked<void>();
    const failure = new Error('notifier failed');
    const errors: unknown[] = [];

    source.observable[repeatWhen](() => notifier.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscribers[0]!.complete();
    notifier.subscribers[0]!.next(undefined);
    notifier.subscribers[0]!.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscribers[1]!.active).toBe(false);
  });

  it('forwards notifier factory and input-conversion failures', () => {
    const factoryFailure = new Error('factory failed');
    const factoryErrors: unknown[] = [];
    const conversionErrors: unknown[] = [];

    Observable.from([] as number[])
      [repeatWhen](() => {
        throw factoryFailure;
      })
      .subscribe({ error: (error) => factoryErrors.push(error) });

    Observable.from([] as number[])
      [repeatWhen](() => ({}) as ObservableValue<never>)
      .subscribe({ error: (error) => conversionErrors.push(error) });

    expect(factoryErrors).toEqual([factoryFailure]);
    expect(conversionErrors[0]).toBeInstanceOf(TypeError);
  });

  it('finalizes each synchronous attempt before iterating without growing the stack', () => {
    const attempts = 5_000;
    const values: number[] = [];
    const teardownOrder: number[] = [];
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      const activation = ++sourceActivations;
      subscriber.addTeardown(() => teardownOrder.push(activation));
      subscriber.next(activation);
      subscriber.complete();
    });

    source[repeatWhen](
      (completions) =>
        new Observable<void>((subscriber) => {
          let completionCount = 0;
          completions.subscribe(
            {
              next: () => {
                if (++completionCount < attempts) {
                  subscriber.next(undefined);
                } else {
                  subscriber.complete();
                }
              },
              error: (error) => subscriber.error(error),
              complete: () => subscriber.complete(),
            },
            { signal: subscriber.signal }
          );
        })
    ).subscribe((value) => values.push(value));

    expect(sourceActivations).toBe(attempts);
    expect(values).toHaveLength(attempts);
    expect(values[0]).toBe(1);
    expect(values.at(-1)).toBe(attempts);
    expect(teardownOrder).toEqual(values);
  });

  it('cancels source and notifier work through the result signal', () => {
    const activeSource = tracked<number>();
    const sourceController = new AbortController();

    activeSource.observable[repeatWhen](() => Observable.from([])).subscribe(() => {}, {
      signal: sourceController.signal,
    });
    sourceController.abort();

    expect(activeSource.subscribers[0]!.active).toBe(false);

    const completedSource = tracked<number>();
    const notifier = tracked<void>();
    const notifierController = new AbortController();

    completedSource.observable[repeatWhen](() => notifier.observable).subscribe(() => {}, {
      signal: notifierController.signal,
    });
    completedSource.subscribers[0]!.complete();
    notifierController.abort();

    expect(notifier.subscribers[0]!.active).toBe(false);
  });

  it('shares and ref-counts one activation, then restarts with fresh source and notifier state', () => {
    const source = tracked<number>();
    const notifiers: Array<ReturnType<typeof tracked<void>>> = [];
    const factory = vi.fn(() => {
      const notifier = tracked<void>();
      notifiers.push(notifier);
      return notifier.observable;
    });
    const repeated = source.observable[repeatWhen](factory);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartedController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    repeated.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    repeated.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    expect(source.activations).toBe(1);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(notifiers[0]!.activations).toBe(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    firstController.abort();
    expect(notifiers[0]!.subscribers[0]!.active).toBe(true);

    secondController.abort();
    expect(notifiers[0]!.subscribers[0]!.active).toBe(false);

    repeated.subscribe((value) => restartedValues.push(value), { signal: restartedController.signal });
    source.subscribers[1]!.next(2);
    source.subscribers[1]!.complete();

    expect(source.activations).toBe(2);
    expect(factory).toHaveBeenCalledTimes(2);
    expect(notifiers[1]!.activations).toBe(1);
    expect(restartedValues).toEqual([2]);

    restartedController.abort();
  });
});

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
