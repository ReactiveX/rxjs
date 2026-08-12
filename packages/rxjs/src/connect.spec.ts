import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type ConnectSymbol = typeof import('./connect.js').connect;
type ConnectConfig<T> = import('./connect.js').ConnectConfig<T>;
type SubjectLike<T> = import('./util/types.js').SubjectLike<T>;
type SubjectCtor = typeof import('./subject.js').Subject;
type ColdObservableCtor = typeof import('./cold-observable.js').ColdObservable;
type ReplaySubjectFactory = typeof import('./replay-subject.js').replaySubject;

let connect: ConnectSymbol;
let Subject: SubjectCtor;
let ColdObservable: ColdObservableCtor;
let replaySubject: ReplaySubjectFactory;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'connect' in Observable.prototype;
  ({ connect } = await import('./connect.js'));
  ({ Subject } = await import('./subject.js'));
  ({ ColdObservable } = await import('./cold-observable.js'));
  ({ replaySubject } = await import('./replay-subject.js'));
});

describe('connect', () => {
  it('installs only its exact unique Symbol and preserves selector and connector types', () => {
    const source = Observable.from([1, 2]);
    const config: ConnectConfig<number> = {
      connector: () => new Subject<number>(),
    };
    const result = source[connect]((shared) => {
      expectTypeOf(shared).toEqualTypeOf<Observable<number>>();
      expectTypeOf(shared).not.toHaveProperty('next');
      return Promise.resolve('selected');
    }, config);
    const otherKey = Symbol('connect');
    type HasStringNamedConnect = 'connect' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<Observable<string>>();
    expectTypeOf<HasStringNamedConnect>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('connect' in Observable.prototype).toBe(false);
    expect(connect.description).toBe('connect');
    expect(Symbol.keyFor(connect)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A selector is required.
      source[connect]();
      // @ts-expect-error The selector must return an ObservableValue.
      source[connect](() => 1);
      // @ts-expect-error The connector must return a SubjectLike.
      source[connect]((shared) => shared, { connector: () => Observable.from([1]) });
      // @ts-expect-error A provided config requires its connector.
      source[connect]((shared) => shared, {});
    }
  });

  it('creates a read-only connector view, subscribes the selector result, then activates the source once', () => {
    const events: string[] = [];
    let sharedWasReadOnly = false;
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    const result = source[connect]((shared) => {
      events.push('selector');
      sharedWasReadOnly = !('next' in shared) && !('error' in shared) && !('complete' in shared);
      return new Observable<string>((subscriber) => {
        events.push('selector result active');
        let completions = 0;
        const complete = () => {
          completions++;
          if (completions === 2) {
            subscriber.complete();
          }
        };
        shared.subscribe(
          {
            next: (value) => subscriber.next(`all ${value}`),
            error: (error) => subscriber.error(error),
            complete,
          },
          { signal: subscriber.signal }
        );
        shared.subscribe(
          {
            next: (value) => {
              if (value % 2 === 0) {
                subscriber.next(`even ${value}`);
              }
            },
            error: (error) => subscriber.error(error),
            complete,
          },
          { signal: subscriber.signal }
        );
      });
    });
    const values: string[] = [];

    result.subscribe({
      next: (value) => values.push(value),
      complete: () => events.push('result complete'),
    });

    expect(sharedWasReadOnly).toBe(true);
    expect(events).toEqual(['selector', 'selector result active', 'source active', 'result complete']);
    expect(values).toEqual(['all 1', 'all 2', 'even 2']);
  });

  it('uses a custom connector and exposes its buffered value before source activation', () => {
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.next(1);
      subscriber.complete();
    });
    const connector = vi.fn(() => {
      const subject = replaySubject<number>({ size: 1 });
      subject.next(0);
      return subject;
    });
    const values: number[] = [];

    source[connect]((shared) => shared, { connector }).subscribe((value) => {
      events.push(`value ${value}`);
      values.push(value);
    });

    expect(connector).toHaveBeenCalledTimes(1);
    expect(events).toEqual(['value 0', 'source active', 'value 1']);
    expect(values).toEqual([0, 1]);
  });

  it('does not activate the source when connector, selector, conversion, or selector subscription setup fails', () => {
    const connectorFailure = new Error('connector failed');
    const connectorSource = tracked<number>();
    const connectorErrors: unknown[] = [];

    connectorSource.observable[connect]((shared) => shared, {
      connector: () => {
        throw connectorFailure;
      },
    }).subscribe({ error: (error) => connectorErrors.push(error) });

    const selectorFailure = new Error('selector failed');
    const selectorSource = tracked<number>();
    const selectorErrors: unknown[] = [];

    selectorSource.observable[connect](() => {
      throw selectorFailure;
    }).subscribe({ error: (error) => selectorErrors.push(error) });

    const conversionFailure = new Error('conversion failed');
    const conversionSource = tracked<number>();
    const conversionErrors: unknown[] = [];

    conversionSource.observable[connect](() => throwingIterable(conversionFailure)).subscribe({
      error: (error) => conversionErrors.push(error),
    });

    const subscriptionFailure = new Error('subscription failed');
    const subscriptionSource = tracked<number>();
    const subscriptionErrors: unknown[] = [];

    subscriptionSource.observable[connect]((shared) => shared, {
      connector: () =>
        ({
          active: true,
          subscribe() {
            throw subscriptionFailure;
          },
          next() {},
          error() {},
          complete() {},
        } as SubjectLike<number>),
    }).subscribe({ error: (error) => subscriptionErrors.push(error) });

    expect(connectorErrors).toEqual([connectorFailure]);
    expect(selectorErrors).toEqual([selectorFailure]);
    expect(conversionErrors).toEqual([conversionFailure]);
    expect(subscriptionErrors).toEqual([subscriptionFailure]);
    expect(connectorSource.activations).toBe(0);
    expect(selectorSource.activations).toBe(0);
    expect(conversionSource.activations).toBe(0);
    expect(subscriptionSource.activations).toBe(0);
  });

  it('cancels the source when the selector result completes or errors', () => {
    const completingSource = tracked<number>();
    const completionGate = controllable<void>();
    const completionEvents: string[] = [];

    completingSource.observable[connect](() => completionGate.observable).subscribe({
      complete: () => completionEvents.push('complete'),
    });
    expect(completingSource.activations).toBe(1);

    completionGate.subscriber.complete();
    expect(completionEvents).toEqual(['complete']);
    expect(completingSource.subscribers[0]!.active).toBe(false);

    const failingSource = tracked<number>();
    const errorGate = controllable<void>();
    const failure = new Error('selector result failed');
    const errors: unknown[] = [];

    failingSource.observable[connect](() => errorGate.observable).subscribe({
      error: (error) => errors.push(error),
    });
    errorGate.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(failingSource.subscribers[0]!.active).toBe(false);
  });

  it('terminates and disconnects when a custom connector throws during source fanout', () => {
    const source = controllable<number>();
    const destination = new Subject<number>();
    const failure = new Error('connector next failed');
    const errors: unknown[] = [];
    const connector: SubjectLike<number> = {
      get active() {
        return destination.active;
      },
      subscribe(observer, config) {
        destination.subscribe(observer, config);
      },
      next() {
        throw failure;
      },
      error(error) {
        destination.error(error);
      },
      complete() {
        destination.complete();
      },
    };

    source.observable[connect]((shared) => shared, { connector: () => connector }).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
  });

  it('publishes one platform run before synchronous reentrant observers join it', () => {
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
    });
    let sourceActivations = 0;
    let connectorCalls = 0;
    let joined = false;
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const result = source[connect]((shared) => shared, {
      connector: () => {
        connectorCalls++;
        return new Subject<number>();
      },
    });

    result.subscribe((value) => {
      firstValues.push(value);
      if (!joined) {
        joined = true;
        result.subscribe((innerValue) => secondValues.push(innerValue));
      }
    });

    expect(sourceActivations).toBe(1);
    expect(connectorCalls).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([2]);
  });

  it('cancels source and selector work only when the final platform observer leaves, then restarts', () => {
    const source = tracked<number>();
    const connector = vi.fn(() => new Subject<number>());
    let selectorTeardowns = 0;
    const result = source.observable[connect](
      (shared) =>
        new Observable<number>((subscriber) => {
          subscriber.addTeardown(() => {
            selectorTeardowns++;
          });
          shared.subscribe(subscriber, { signal: subscriber.signal });
        }),
      { connector }
    );
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscribers[0]!.next(1);

    firstController.abort();
    source.subscribers[0]!.next(2);

    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1, 2]);
    expect(source.subscribers[0]!.active).toBe(true);
    expect(selectorTeardowns).toBe(0);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);
    expect(selectorTeardowns).toBe(1);

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    source.subscribers[1]!.next(3);

    expect(connector).toHaveBeenCalledTimes(2);
    expect(source.activations).toBe(2);
    expect(restartedValues).toEqual([3]);

    restartController.abort();
    expect(selectorTeardowns).toBe(2);
  });

  it('creates an independent connector and source run for each ColdObservable subscription', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let connectorCalls = 0;
    const source = new ColdObservable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
    });
    const result = source[connect]((shared) => shared, {
      connector: () => {
        connectorCalls++;
        return new Subject<number>();
      },
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(connectorCalls).toBe(2);
    expect(sourceSubscribers).toHaveLength(2);

    sourceSubscribers[0]!.next(1);
    sourceSubscribers[1]!.next(2);

    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([2]);

    firstController.abort();
    secondController.abort();
    expect(sourceSubscribers[0]!.active).toBe(false);
    expect(sourceSubscribers[1]!.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  const observable = new Observable<T>((subscriber) => {
    sourceSubscriber = subscriber;
  });
  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('Expected activation.');
      }
      return sourceSubscriber;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
} {
  const subscribers: Subscriber<T>[] = [];
  let activations = 0;
  const observable = new Observable<T>((subscriber) => {
    activations++;
    subscribers.push(subscriber);
  });
  return {
    observable,
    subscribers,
    get activations() {
      return activations;
    },
  };
}

function throwingIterable(error: unknown): Iterable<never> {
  return {
    [Symbol.iterator]() {
      throw error;
    },
  };
}
