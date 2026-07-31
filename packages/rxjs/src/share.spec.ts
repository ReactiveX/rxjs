import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type ShareSymbol = typeof import('./share.js').share;
type ShareConfig<T> = import('./share.js').ShareConfig<T>;
type SubjectLike<T> = import('./util/types.js').SubjectLike<T>;
type SubjectCtor = typeof import('./subject.js').Subject;
type ColdObservableCtor = typeof import('./cold-observable.js').ColdObservable;
type ReplaySubjectFactory = typeof import('./replay-subject.js').replaySubject;

let share: ShareSymbol;
let Subject: SubjectCtor;
let ColdObservable: ColdObservableCtor;
let replaySubject: ReplaySubjectFactory;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'share' in Observable.prototype;
  ({ share } = await import('./share.js'));
  ({ Subject } = await import('./subject.js'));
  ({ ColdObservable } = await import('./cold-observable.js'));
  ({ replaySubject } = await import('./replay-subject.js'));
});

describe('share', () => {
  it('installs only its exact unique Symbol and exposes the RxJS 7 ShareConfig types', () => {
    const source = Observable.from([1, 2]);
    const config: ShareConfig<number> = {
      connector: () => new Subject<number>(),
      resetOnError: (error) => {
        expectTypeOf(error).toBeAny();
        return Promise.resolve();
      },
      resetOnComplete: () => [undefined],
      resetOnRefCountZero: false,
    };
    const shared = source[share](config);
    const otherKey = Symbol('share');
    type HasStringNamedShare = 'share' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(shared).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedShare>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('share' in Observable.prototype).toBe(false);
    expect(share.description).toBe('share');
    expect(Symbol.keyFor(share)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A connector must return a SubjectLike.
      source[share]({ connector: () => Observable.from([1]) });
      // @ts-expect-error Reset factories must return an ObservableValue.
      source[share]({ resetOnComplete: () => 1 });
      // @ts-expect-error Reset options accept only booleans or notifier factories.
      source[share]({ resetOnRefCountZero: 'yes' });
    }
  });

  it('uses one connector and source connection for concurrent platform observers, then restarts', () => {
    const source = tracked<number>();
    const connector = vi.fn(() => new Subject<number>());
    const shared = source.observable[share]({ connector });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    shared.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    shared.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscribers[0]!.next(1);

    expect(source.activations).toBe(1);
    expect(connector).toHaveBeenCalledTimes(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    firstController.abort();
    expect(source.subscribers[0]!.active).toBe(true);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);

    shared.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    source.subscribers[1]!.next(2);

    expect(source.activations).toBe(2);
    expect(connector).toHaveBeenCalledTimes(2);
    expect(restartedValues).toEqual([2]);

    restartController.abort();
  });

  it('publishes the connection before synchronous ColdObservable fanout can subscribe reentrantly', () => {
    let sourceActivations = 0;
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const source = new ColdObservable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
    });
    const shared = source[share]();
    let joined = false;

    shared.subscribe((value) => {
      firstValues.push(value);
      if (!joined) {
        joined = true;
        shared.subscribe((innerValue) => secondValues.push(innerValue));
      }
    });

    expect(sourceActivations).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([2]);
  });

  it('disconnects a synchronous platform firehose as soon as its final observer aborts', () => {
    const produced: number[] = [];
    const values: number[] = [];
    const controller = new AbortController();
    const source = new Observable<number>((subscriber) => {
      for (let value = 0; subscriber.active && value < 10; value++) {
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[share]().subscribe(
      (value) => {
        values.push(value);
        if (value === 2) {
          controller.abort();
        }
      },
      { signal: controller.signal }
    );

    expect(values).toEqual([0, 1, 2]);
    expect(produced).toEqual([0, 1, 2]);
  });

  it('disconnects only when the final ColdObservable subscriber leaves', () => {
    const connections: Subscriber<number>[] = [];
    const trackedSource = new ColdObservable<number>((subscriber) => {
      connections.push(subscriber);
    });
    const shared = trackedSource[share]();
    const firstController = new AbortController();
    const secondController = new AbortController();

    shared.subscribe(() => {}, { signal: firstController.signal });
    shared.subscribe(() => {}, { signal: secondController.signal });

    expect(connections).toHaveLength(1);
    firstController.abort();
    expect(connections[0]!.active).toBe(true);

    secondController.abort();
    expect(connections[0]!.active).toBe(false);
  });

  it('retains terminal subjects when resetOnError and resetOnComplete are false', () => {
    const errorFailure = new Error('source failed');
    const errorSource = tracked<number>();
    const errorConnector = vi.fn(() => new Subject<number>());
    const errored = errorSource.observable[share]({
      connector: errorConnector,
      resetOnError: false,
    });
    const firstErrors: unknown[] = [];
    const lateErrors: unknown[] = [];

    errored.subscribe({ error: (error) => firstErrors.push(error) });
    errorSource.subscribers[0]!.error(errorFailure);
    errored.subscribe({ error: (error) => lateErrors.push(error) });

    expect(firstErrors).toEqual([errorFailure]);
    expect(lateErrors).toEqual([errorFailure]);
    expect(errorSource.activations).toBe(1);
    expect(errorConnector).toHaveBeenCalledTimes(1);

    const completeSource = tracked<number>();
    const completeConnector = vi.fn(() => new Subject<number>());
    const completed = completeSource.observable[share]({
      connector: completeConnector,
      resetOnComplete: false,
    });
    let firstCompletions = 0;
    let lateCompletions = 0;

    completed.subscribe({ complete: () => firstCompletions++ });
    completeSource.subscribers[0]!.complete();
    completed.subscribe({ complete: () => lateCompletions++ });

    expect(firstCompletions).toBe(1);
    expect(lateCompletions).toBe(1);
    expect(completeSource.activations).toBe(1);
    expect(completeConnector).toHaveBeenCalledTimes(1);
  });

  it('resets by default after source error and completion for later observers', () => {
    const errorSource = tracked<number>();
    const errored = errorSource.observable[share]();
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    const recoveredValues: number[] = [];

    errored.subscribe({ error: (error) => errors.push(error) });
    errorSource.subscribers[0]!.error(failure);
    errored.subscribe((value) => recoveredValues.push(value));
    errorSource.subscribers[1]!.next(1);

    expect(errors).toEqual([failure]);
    expect(errorSource.activations).toBe(2);
    expect(recoveredValues).toEqual([1]);

    const completeSource = tracked<number>();
    const completed = completeSource.observable[share]();
    let completions = 0;

    completed.subscribe({ complete: () => completions++ });
    completeSource.subscribers[0]!.complete();
    completed.subscribe({ complete: () => completions++ });
    completeSource.subscribers[1]!.complete();

    expect(completeSource.activations).toBe(2);
    expect(completions).toBe(2);
  });

  it('keeps a zero-ref-count connection when configured and lets a later activation rejoin it', () => {
    const source = tracked<number>();
    const shared = source.observable[share]({ resetOnRefCountZero: false });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const secondValues: number[] = [];

    shared.subscribe(() => {}, { signal: firstController.signal });
    firstController.abort();

    expect(source.subscribers[0]!.active).toBe(true);

    source.subscribers[0]!.next(1);
    shared.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscribers[0]!.next(2);

    expect(source.activations).toBe(1);
    expect(secondValues).toEqual([2]);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    source.subscribers[0]!.complete();
  });

  it('delays a ref-count reset and cancels it when a new activation arrives', () => {
    const source = tracked<number>();
    const reset = tracked<void>();
    const shared = source.observable[share]({ resetOnRefCountZero: () => reset.observable });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const thirdController = new AbortController();

    shared.subscribe(() => {}, { signal: firstController.signal });
    firstController.abort();

    expect(reset.activations).toBe(1);
    expect(source.subscribers[0]!.active).toBe(true);

    shared.subscribe(() => {}, { signal: secondController.signal });
    expect(reset.subscribers[0]!.active).toBe(false);
    expect(source.activations).toBe(1);

    secondController.abort();
    expect(reset.activations).toBe(2);
    reset.subscribers[1]!.next(undefined);
    expect(source.subscribers[0]!.active).toBe(false);

    shared.subscribe(() => {}, { signal: thirdController.signal });
    expect(source.activations).toBe(2);
    thirdController.abort();
  });

  it('delays terminal reset without cancelling it for a late terminal observer', () => {
    const failure = new Error('source failed');
    const source = tracked<number>();
    const reset = tracked<void>();
    const resetErrors: unknown[] = [];
    const shared = source.observable[share]({
      resetOnError: (error) => {
        resetErrors.push(error);
        return reset.observable;
      },
    });
    const firstErrors: unknown[] = [];
    const lateErrors: unknown[] = [];

    shared.subscribe({ error: (error) => firstErrors.push(error) });
    source.subscribers[0]!.error(failure);
    shared.subscribe({ error: (error) => lateErrors.push(error) });

    expect(resetErrors).toEqual([failure]);
    expect(reset.activations).toBe(1);
    expect(reset.subscribers[0]!.active).toBe(true);
    expect(source.activations).toBe(1);
    expect(firstErrors).toEqual([failure]);
    expect(lateErrors).toEqual([failure]);

    reset.subscribers[0]!.next(undefined);
    shared.subscribe(() => {});

    expect(source.activations).toBe(2);
  });

  it('does not reset when a reset notifier completes without a value', () => {
    const source = tracked<number>();
    const reset = tracked<void>();
    const shared = source.observable[share]({ resetOnRefCountZero: () => reset.observable });
    const firstController = new AbortController();
    const secondController = new AbortController();

    shared.subscribe(() => {}, { signal: firstController.signal });
    firstController.abort();
    reset.subscribers[0]!.complete();

    expect(source.subscribers[0]!.active).toBe(true);

    shared.subscribe(() => {}, { signal: secondController.signal });
    expect(source.activations).toBe(1);
    secondController.abort();
    source.subscribers[0]!.complete();
  });

  it('reports reset notifier factory, conversion, and notification errors without resetting', () => {
    const reportError = vi.fn();
    const originalReportError = globalThis.reportError;
    Object.defineProperty(globalThis, 'reportError', {
      configurable: true,
      value: reportError,
      writable: true,
    });

    try {
      const factoryFailure = new Error('factory failed');
      const factorySource = tracked<number>();
      const factoryController = new AbortController();
      const factoryShared = factorySource.observable[share]({
        resetOnRefCountZero: () => {
          throw factoryFailure;
        },
      });

      factoryShared.subscribe(() => {}, { signal: factoryController.signal });
      factoryController.abort();

      const conversionSource = tracked<number>();
      const conversionController = new AbortController();
      const conversionShared = conversionSource.observable[share]({
        resetOnRefCountZero: () => ({} as ObservableValue<never>),
      });

      conversionShared.subscribe(() => {}, { signal: conversionController.signal });
      conversionController.abort();

      const notifierFailure = new Error('notifier failed');
      const notifierSource = tracked<number>();
      const notifier = tracked<void>();
      const notifierController = new AbortController();
      const notifierShared = notifierSource.observable[share]({
        resetOnRefCountZero: () => notifier.observable,
      });

      notifierShared.subscribe(() => {}, { signal: notifierController.signal });
      notifierController.abort();
      notifier.subscribers[0]!.error(notifierFailure);

      expect(reportError).toHaveBeenCalledWith(factoryFailure);
      expect(reportError.mock.calls.some(([error]) => error instanceof TypeError)).toBe(true);
      expect(reportError).toHaveBeenCalledWith(notifierFailure);
      expect(factorySource.subscribers[0]!.active).toBe(true);
      expect(conversionSource.subscribers[0]!.active).toBe(true);
      expect(notifierSource.subscribers[0]!.active).toBe(true);
    } finally {
      Object.defineProperty(globalThis, 'reportError', {
        configurable: true,
        value: originalReportError,
        writable: true,
      });
    }
  });

  it('forwards connector factory and connector subscription failures and can retry creation', () => {
    const factoryFailure = new Error('connector failed');
    const source = tracked<number>();
    const connector = vi
      .fn(() => new Subject<number>())
      .mockImplementationOnce(() => {
        throw factoryFailure;
      })
      .mockImplementation(() => new Subject<number>());
    const shared = source.observable[share]({ connector });
    const errors: unknown[] = [];
    const values: number[] = [];

    shared.subscribe({ error: (error) => errors.push(error) });
    expect(errors).toEqual([factoryFailure]);
    shared.subscribe((value) => values.push(value));
    source.subscribers[0]!.next(1);

    expect(connector).toHaveBeenCalledTimes(2);
    expect(source.activations).toBe(1);
    expect(values).toEqual([1]);

    const invalidSource = tracked<number>();
    const invalidErrors: unknown[] = [];
    const invalid = invalidSource.observable[share]({
      connector: () => ({} as SubjectLike<number>),
    });

    invalid.subscribe({ error: (error) => invalidErrors.push(error) });

    expect(invalidErrors[0]).toBeInstanceOf(TypeError);
    expect(invalidSource.activations).toBe(0);
  });

  it('documents the platform late-observer replay limitation while ColdObservable preserves connector fanout', () => {
    const platformSource = tracked<number>();
    const platformShared = platformSource.observable[share]({
      connector: () => replaySubject<number>({ size: 1 }),
    });
    const platformFirst: number[] = [];
    const platformLate: number[] = [];

    platformShared.subscribe((value) => platformFirst.push(value));
    platformSource.subscribers[0]!.next(1);
    platformShared.subscribe((value) => platformLate.push(value));

    // A late observer joins the already-active platform Subscriber directly,
    // so share cannot route that join through the replaying connector.
    expect(platformFirst).toEqual([1]);
    expect(platformLate).toEqual([]);

    platformSource.subscribers[0]!.next(2);
    expect(platformFirst).toEqual([1, 2]);
    expect(platformLate).toEqual([2]);

    let coldSubscriber: Subscriber<number> | undefined;
    const coldSource = new ColdObservable<number>((subscriber) => {
      coldSubscriber = subscriber;
    });
    const coldShared = coldSource[share]({
      connector: () => replaySubject<number>({ size: 1 }),
    });
    const coldFirst: number[] = [];
    const coldLate: number[] = [];

    coldShared.subscribe((value) => coldFirst.push(value));
    coldSubscriber?.next(1);
    coldShared.subscribe((value) => coldLate.push(value));

    expect(coldFirst).toEqual([1]);
    expect(coldLate).toEqual([1]);
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
