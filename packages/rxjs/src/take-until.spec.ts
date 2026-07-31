import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type TakeUntilSymbol = typeof import('./take-until.js').takeUntil;

let takeUntil: TakeUntilSymbol;
let platformTakeUntil: Observable<unknown>['takeUntil'];

beforeAll(async () => {
  platformTakeUntil = Observable.prototype.takeUntil;
  ({ takeUntil } = await import('./take-until.js'));
});

describe('takeUntil', () => {
  it('subscribes to the notifier first and does not activate the source after a synchronous notifier value', () => {
    const events: string[] = [];
    let notifierActiveAfterNext = true;
    const notifier = new Observable<void>((subscriber) => {
      events.push('notifier');
      subscriber.next(undefined);
      notifierActiveAfterNext = subscriber.active;
      subscriber.next(undefined);
    });
    const source = new Observable<number>(() => {
      events.push('source');
    });

    source[takeUntil](notifier).subscribe({
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['notifier', 'complete']);
    expect(notifierActiveAfterNext).toBe(false);
  });

  it('activates the source when a synchronous notifier completes without emitting', () => {
    const events: Array<string | number> = [];
    const notifier = new Observable<void>((subscriber) => {
      events.push('notifier');
      subscriber.complete();
    });
    const source = new Observable<number>((subscriber) => {
      events.push('source');
      subscriber.next(1);
      subscriber.complete();
    });

    source[takeUntil](notifier).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['notifier', 'source', 1, 'complete']);
  });

  it('errors without activating the source when the notifier synchronously errors', () => {
    const failure = new Error('notifier failed');
    const errors: unknown[] = [];
    let sourceActivations = 0;
    const notifier = new Observable<never>((subscriber) => subscriber.error(failure));
    const source = new Observable<number>(() => {
      sourceActivations++;
    });

    source[takeUntil](notifier).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
    expect(sourceActivations).toBe(0);
  });

  it('forwards source values until the first notifier value and then cancels both inputs', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const observations: Array<number | 'complete'> = [];

    source.observable[takeUntil](notifier.observable).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    source.subscriber.next(1);
    source.subscriber.next(2);
    notifier.subscriber.next(undefined);
    source.subscriber.next(3);

    expect(observations).toEqual([1, 2, 'complete']);
    expect(source.subscriber.active).toBe(false);
    expect(notifier.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
  });

  it('does not stop the source when the notifier completes without a value', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const observations: Array<number | 'complete'> = [];

    source.observable[takeUntil](notifier.observable).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    notifier.subscriber.complete();
    source.subscriber.next(1);
    source.subscriber.complete();

    expect(observations).toEqual([1, 'complete']);
    expect(notifier.teardowns).toBe(1);
    expect(source.teardowns).toBe(1);
  });

  it('forwards a source error and cancels the notifier', () => {
    const failure = new Error('source failed');
    const source = controllable<number>();
    const notifier = controllable<void>();
    const errors: unknown[] = [];

    source.observable[takeUntil](notifier.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
    expect(notifier.subscriber.active).toBe(false);
  });

  it('reports notifier conversion errors without activating the source', () => {
    const failure = new Error('conversion failed');
    const errors: unknown[] = [];
    const events: string[] = [];
    const invalidNotifier = Object.defineProperty({}, Symbol.iterator, {
      get() {
        events.push('convert notifier');
        throw failure;
      },
    });
    const source = new Observable<number>(() => {
      events.push('source');
    });

    source[takeUntil](invalidNotifier as ObservableValue<never>).subscribe({
      error: (error) => errors.push(error),
    });

    expect(events).toEqual(['convert notifier']);
    expect(errors).toEqual([failure]);
  });

  it('closes both inputs before delivering reentrant notifier completion downstream', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const observations: Array<number | 'complete'> = [];
    let inputsActiveAtCompletion: [boolean, boolean] | undefined;

    source.observable[takeUntil](notifier.observable).subscribe({
      next: (value) => {
        observations.push(value);
        notifier.subscriber.next(undefined);
      },
      complete: () => {
        inputsActiveAtCompletion = [source.subscriber.active, notifier.subscriber.active];
        observations.push('complete');
      },
    });
    source.subscriber.next(1);
    source.subscriber.next(2);

    expect(observations).toEqual([1, 'complete']);
    expect(inputsActiveAtCompletion).toEqual([false, false]);
  });

  it('propagates last-observer cancellation to both inputs', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const controller = new AbortController();

    source.observable[takeUntil](notifier.observable).subscribe(() => {}, { signal: controller.signal });
    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(notifier.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
  });

  it('shares and ref-counts one activation, then starts fresh source and notifier work after cancellation', () => {
    const source = tracked<number>();
    const notifier = tracked<void>();
    const result = source.observable[takeUntil](notifier.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: Array<number | 'complete'> = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(notifier.activations).toBe(1);
    expect(source.activations).toBe(1);

    source.subscribers[0]!.next(1);
    firstController.abort();
    source.subscribers[0]!.next(2);

    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1, 2]);
    expect(source.teardowns).toBe(0);
    expect(notifier.teardowns).toBe(0);

    secondController.abort();

    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);

    result.subscribe({
      next: (value) => restartedValues.push(value),
      complete: () => restartedValues.push('complete'),
    });

    expect(notifier.activations).toBe(2);
    expect(source.activations).toBe(2);

    source.subscribers[1]!.next(3);
    notifier.subscribers[1]!.next(undefined);

    expect(restartedValues).toEqual([3, 'complete']);
    expect(source.teardowns).toBe(2);
    expect(notifier.teardowns).toBe(2);
  });

  it('preserves source types and installs only its exact unique Symbol without changing the platform method', () => {
    const source = new Observable<number>(() => {});
    const otherKey = Symbol('takeUntil');
    const withObservableNotifier = source[takeUntil](new Observable<string>(() => {}));
    const withIterableNotifier = source[takeUntil](['stop']);
    const withPromiseNotifier = source[takeUntil](Promise.resolve('stop'));

    expectTypeOf(withObservableNotifier).toEqualTypeOf<Observable<number>>();
    expectTypeOf(withIterableNotifier).toEqualTypeOf<Observable<number>>();
    expectTypeOf(withPromiseNotifier).toEqualTypeOf<Observable<number>>();
    expect(takeUntil.description).toBe('takeUntil');
    expect(Symbol.keyFor(takeUntil)).toBeUndefined();
    expect(Observable.prototype.takeUntil).toBe(platformTakeUntil);
    expect(source[takeUntil]).not.toBe(platformTakeUntil);
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
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
    get teardowns() {
      return teardowns;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: readonly Subscriber<T>[];
  readonly activations: number;
  readonly teardowns: number;
} {
  const subscribers: Subscriber<T>[] = [];
  let activations = 0;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    activations++;
    subscribers.push(subscriber);
    subscriber.addTeardown(() => {
      teardowns++;
    });
  });

  return {
    observable,
    subscribers,
    get activations() {
      return activations;
    },
    get teardowns() {
      return teardowns;
    },
  };
}
