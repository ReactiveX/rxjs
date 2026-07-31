import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type SkipUntilSymbol = typeof import('./skip-until.js').skipUntil;

let skipUntil: SkipUntilSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'skipUntil' in Observable.prototype;
  ({ skipUntil } = await import('./skip-until.js'));
});

describe('skipUntil', () => {
  it('installs only an exact unique Symbol-keyed operator and preserves the source type', () => {
    const skipped = Observable.from([1, 2, 3])[skipUntil]([true]);
    type HasStringNamedSkipUntil = 'skipUntil' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(skipped).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedSkipUntil>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('skipUntil' in Observable.prototype).toBe(false);
    expect(skipUntil.description).toBe('skipUntil');
    expect(Symbol.keyFor(skipUntil)).toBeUndefined();
    expect(Symbol('skipUntil')).not.toBe(skipUntil);
  });

  it('subscribes to the notifier before the source and opens the gate for a synchronous notifier value', () => {
    const order: string[] = [];
    const values: number[] = [];
    const notifier = new Observable<void>((subscriber) => {
      order.push('notifier');
      subscriber.next(undefined);
    });
    const source = new Observable<number>((subscriber) => {
      order.push('source');
      subscriber.next(1);
      subscriber.complete();
    });

    source[skipUntil](notifier).subscribe((value) => values.push(value));

    expect(order).toEqual(['notifier', 'source']);
    expect(values).toEqual([1]);
  });

  it('suppresses source values until the notifier emits and cancels the notifier after its first value', () => {
    const source = controllable<number>();
    const notifier = controllable<string>();
    const observations: Array<number | 'complete'> = [];

    source.observable[skipUntil](notifier.observable).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });

    source.subscriber.next(1);
    notifier.subscriber.next('open');
    expect(notifier.teardowns).toBe(1);
    expect(notifier.subscriber.active).toBe(false);

    source.subscriber.next(2);
    source.subscriber.complete();

    expect(observations).toEqual([2, 'complete']);
  });

  it('keeps the gate closed when the notifier completes without a value while the source remains active', () => {
    const source = controllable<number>();
    const notifier = controllable<never>();
    const observations: Array<number | 'complete'> = [];

    source.observable[skipUntil](notifier.observable).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });

    notifier.subscriber.complete();
    source.subscriber.next(1);
    source.subscriber.next(2);

    expect(source.subscriber.active).toBe(true);
    expect(observations).toEqual([]);

    source.subscriber.complete();

    expect(observations).toEqual(['complete']);
  });

  it('forwards notifier errors and cancels active source work', () => {
    const failure = new Error('notifier failed');
    const source = controllable<number>();
    const notifier = controllable<never>();
    const errors: unknown[] = [];

    source.observable[skipUntil](notifier.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    notifier.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
  });

  it('does not activate the source after a synchronous notifier error', () => {
    const failure = new Error('synchronous notifier failure');
    let sourceActivations = 0;
    const errors: unknown[] = [];
    const notifier = new Observable<never>((subscriber) => subscriber.error(failure));
    const source = new Observable<number>(() => {
      sourceActivations++;
    });

    source[skipUntil](notifier).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
    expect(sourceActivations).toBe(0);
  });

  it('cancels the notifier when the source completes or errors', () => {
    const failure = new Error('source failed');
    const completingNotifier = controllable<void>();
    const failingNotifier = controllable<void>();
    const completingSource = controllable<number>();
    const failingSource = controllable<number>();
    const completions: string[] = [];
    const errors: unknown[] = [];

    completingSource.observable[skipUntil](completingNotifier.observable).subscribe({
      complete: () => completions.push('complete'),
    });
    completingSource.subscriber.complete();

    failingSource.observable[skipUntil](failingNotifier.observable).subscribe({
      error: (error) => errors.push(error),
    });
    failingSource.subscriber.error(failure);

    expect(completions).toEqual(['complete']);
    expect(errors).toEqual([failure]);
    expect(completingNotifier.teardowns).toBe(1);
    expect(failingNotifier.teardowns).toBe(1);
  });

  it('propagates downstream cancellation to both source and notifier', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const controller = new AbortController();

    source.observable[skipUntil](notifier.observable).subscribe(() => {}, { signal: controller.signal });
    controller.abort();

    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
  });

  it('tears down a synchronous notifier before continuing its producer and activating the source', () => {
    const order: string[] = [];
    const notifier = new Observable<void>((subscriber) => {
      order.push('notifier start');
      subscriber.addTeardown(() => order.push('notifier teardown'));
      subscriber.next(undefined);
      order.push('notifier after next');
    });
    const source = new Observable<number>((subscriber) => {
      order.push('source start');
      subscriber.next(1);
      subscriber.complete();
    });
    const values: number[] = [];

    source[skipUntil](notifier).subscribe((value) => values.push(value));

    expect(order).toEqual(['notifier start', 'notifier teardown', 'notifier after next', 'source start']);
    expect(values).toEqual([1]);
  });

  it('stops a synchronous notifier producer after its first value', () => {
    const effects: number[] = [];
    const notifier = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (subscriber.active) {
          effects.push(value);
          subscriber.next(value);
        }
      }
    });
    const values: number[] = [];

    Observable.from([10])[skipUntil](notifier).subscribe((value) => values.push(value));

    expect(effects).toEqual([1]);
    expect(values).toEqual([10]);
  });

  it('opens after a Promise resolves and forwards Promise rejection', async () => {
    const sourceAfterResolve = controllable<number>();
    const sourceAfterReject = controllable<number>();
    const failure = new Error('rejected notifier');
    const values: number[] = [];
    const errors: unknown[] = [];

    sourceAfterResolve.observable[skipUntil](Promise.resolve('open')).subscribe((value) => values.push(value));
    sourceAfterReject.observable[skipUntil](Promise.reject(failure)).subscribe({
      error: (error) => errors.push(error),
    });

    sourceAfterResolve.subscriber.next(1);
    await Promise.resolve();
    sourceAfterResolve.subscriber.next(2);
    await Promise.resolve();

    expect(values).toEqual([2]);
    expect(errors).toEqual([failure]);
    expect(sourceAfterReject.teardowns).toBe(1);
  });

  it('forwards ObservableValue conversion errors without activating the source', () => {
    const failure = new Error('conversion failed');
    let sourceActivations = 0;
    const errors: unknown[] = [];
    const notifier = Object.defineProperty({}, Symbol.iterator, {
      get() {
        throw failure;
      },
    }) as Iterable<never>;
    const source = new Observable<number>(() => {
      sourceActivations++;
    });

    source[skipUntil](notifier).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
    expect(sourceActivations).toBe(0);
  });

  it('shares gate and source work, ref-counts cancellation, and restarts with a closed gate', () => {
    const source = controllable<number>();
    const notifier = controllable<void>();
    const skipped = source.observable[skipUntil](notifier.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    skipped.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    skipped.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriptions).toBe(1);

    source.subscriber.next(1);
    notifier.subscriber.next(undefined);
    source.subscriber.next(2);

    expect(firstValues).toEqual([2]);
    expect(secondValues).toEqual([2]);
    expect(notifier.teardowns).toBe(1);

    firstController.abort();
    source.subscriber.next(3);

    expect(firstValues).toEqual([2]);
    expect(secondValues).toEqual([2, 3]);
    expect(source.teardowns).toBe(0);

    secondController.abort();

    expect(source.teardowns).toBe(1);

    const restartedValues: number[] = [];
    skipped.subscribe((value) => restartedValues.push(value));

    expect(source.subscriptions).toBe(2);
    expect(notifier.subscriptions).toBe(2);

    source.subscriber.next(4);
    expect(restartedValues).toEqual([]);

    notifier.subscriber.next(undefined);
    source.subscriber.next(5);

    expect(restartedValues).toEqual([5]);
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
