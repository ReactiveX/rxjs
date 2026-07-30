import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type ConnectableModule = typeof import('./connectable.js');
type ConnectableConfig<T> = import('./connectable.js').ConnectableConfig<T>;
type ConnectableConnection = import('./connectable.js').ConnectableConnection;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;
type SubjectCtor = typeof import('./subject.js').Subject;
type SubjectLike<T> = import('./util/types.js').SubjectLike<T>;
type ReplaySubjectFactory = typeof import('./replay-subject.js').replaySubject;

let connectable: ConnectableModule['connectable'];
let ConnectableObservable: ConnectableModule['ConnectableObservable'];
let Subject: SubjectCtor;
let replaySubject: ReplaySubjectFactory;

beforeAll(async () => {
  ({ connectable, ConnectableObservable } = await import('./connectable.js'));
  ({ Subject } = await import('./subject.js'));
  ({ replaySubject } = await import('./replay-subject.js'));
});

describe('connectable', () => {
  it('exposes the standalone function, concrete compatibility class, config, and connection facade types', () => {
    const source = new Observable<number>(() => {});
    const config: ConnectableConfig<number> = {
      connector: () => new Subject<number>(),
      resetOnDisconnect: true,
    };
    const result = connectable(source, config);
    const legacy = new ConnectableObservable(source, () => new Subject<number>());
    const connection: ConnectableConnection = result.connect();

    expectTypeOf(result).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(result.connect).toEqualTypeOf<() => ConnectableConnection>();
    expectTypeOf(connection.closed).toEqualTypeOf<boolean>();
    expect(result).toBeInstanceOf(Observable);
    expect(result).toBeInstanceOf(ConnectableObservable);
    expect(legacy).toBeInstanceOf(ConnectableObservable);
    expect('next' in result).toBe(false);
    expect('error' in result).toBe(false);
    expect('complete' in result).toBe(false);
    expect('connect' in Observable.prototype).toBe(false);

    connection.unsubscribe();

    if (false) {
      // @ts-expect-error A connector must return a SubjectLike.
      connectable(source, { connector: () => source });
      // @ts-expect-error resetOnDisconnect is boolean.
      connectable(source, { connector: () => new Subject<number>(), resetOnDisconnect: 'yes' });
    }
  });

  it('waits for connect, fans one source connection to concurrent observers, and returns one active facade', () => {
    const source = tracked<number>();
    const result = connectable(source.observable);
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    result.subscribe((value) => secondValues.push(value));

    expect(source.activations).toBe(0);

    const firstConnection = result.connect();
    const sameConnection = result.connect();
    source.subscribers[0]!.next(1);

    expect(firstConnection).toBe(sameConnection);
    expect(firstConnection.closed).toBe(false);
    expect(source.activations).toBe(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    firstConnection.unsubscribe();
  });

  it('disconnects and eagerly resets to a fresh connector before a later observer and connection', () => {
    const source = tracked<number>();
    const connector = vi.fn(() => new Subject<number>());
    const result = connectable(source.observable, { connector, resetOnDisconnect: true });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    firstConnection.unsubscribe();

    expect(firstConnection.closed).toBe(true);
    expect(source.subscribers[0]!.active).toBe(false);
    expect(connector).toHaveBeenCalledTimes(2);

    firstController.abort();
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);

    expect(secondConnection).not.toBe(firstConnection);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([2]);
    expect(source.activations).toBe(2);

    secondConnection.unsubscribe();
    secondController.abort();
  });

  it('retains the same connector across disconnects when resetOnDisconnect is false', () => {
    const source = tracked<number>();
    const connector = vi.fn(() => replaySubject<number>({ size: 1 }));
    const result = connectable(source.observable, { connector, resetOnDisconnect: false });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    firstConnection.unsubscribe();
    firstController.abort();

    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);

    expect(connector).toHaveBeenCalledTimes(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1, 2]);

    secondConnection.unsubscribe();
    secondController.abort();
  });

  it('forwards source completion and error through the connector before closing each connection', () => {
    const completingSource = tracked<number>();
    const completingConnector = vi.fn(() => new Subject<number>());
    const completing = connectable(completingSource.observable, {
      connector: completingConnector,
    });
    const completionEvents: string[] = [];

    completing.subscribe({
      complete: () => completionEvents.push('complete'),
    });
    const completedConnection = completing.connect();
    completingSource.subscribers[0]!.complete();

    const failure = new Error('source failed');
    const failingSource = tracked<number>();
    const failingConnector = vi.fn(() => new Subject<number>());
    const failing = connectable(failingSource.observable, {
      connector: failingConnector,
    });
    const errors: unknown[] = [];

    failing.subscribe({ error: (error) => errors.push(error) });
    const failedConnection = failing.connect();
    failingSource.subscribers[0]!.error(failure);

    expect(completionEvents).toEqual(['complete']);
    expect(completedConnection.closed).toBe(true);
    expect(completingConnector).toHaveBeenCalledTimes(2);
    expect(errors).toEqual([failure]);
    expect(failedConnection.closed).toBe(true);
    expect(failingConnector).toHaveBeenCalledTimes(2);
  });

  it('does not leak source work when connector creation, subscription, fanout, or source setup fails', () => {
    const creationFailure = new Error('connector creation failed');
    const creationSource = tracked<number>();

    expect(() =>
      connectable(creationSource.observable, {
        connector: () => {
          throw creationFailure;
        },
      })
    ).toThrow(creationFailure);
    expect(creationSource.activations).toBe(0);

    const subscriptionFailure = new Error('connector subscription failed');
    const subscriptionSource = tracked<number>();
    const subscriptionErrors: unknown[] = [];
    const brokenSubscription = connectable(subscriptionSource.observable, {
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
    });

    brokenSubscription.subscribe({ error: (error) => subscriptionErrors.push(error) });
    expect(subscriptionErrors).toEqual([subscriptionFailure]);
    expect(subscriptionSource.activations).toBe(0);

    const fanoutFailure = new Error('connector fanout failed');
    const fanoutSource = tracked<number>();
    const fanoutErrors: unknown[] = [];
    const fanoutSubject = new Subject<number>();
    const brokenFanout = connectable(fanoutSource.observable, {
      connector: () => ({
        get active() {
          return fanoutSubject.active;
        },
        subscribe(observer, options) {
          fanoutSubject.subscribe(observer, options);
        },
        next() {
          throw fanoutFailure;
        },
        error(error) {
          fanoutSubject.error(error);
        },
        complete() {
          fanoutSubject.complete();
        },
      }),
    });

    brokenFanout.subscribe({ error: (error) => fanoutErrors.push(error) });
    const fanoutConnection = brokenFanout.connect();
    fanoutSource.subscribers[0]!.next(1);

    const sourceFailure = new Error('source setup failed');
    const brokenSource = new Observable<number>(() => {
      throw sourceFailure;
    });
    const sourceErrors: unknown[] = [];
    const converted = connectable(brokenSource);

    converted.subscribe({ error: (error) => sourceErrors.push(error) });
    const sourceConnection = converted.connect();

    expect(fanoutErrors).toEqual([fanoutFailure]);
    expect(fanoutConnection.closed).toBe(true);
    expect(fanoutSource.subscribers[0]!.active).toBe(false);
    expect(sourceErrors).toEqual([sourceFailure]);
    expect(sourceConnection.closed).toBe(true);
  });

  it('publishes the connection facade before synchronous source fanout and closes it on terminal', () => {
    const values: number[] = [];
    let sourceActivations = 0;
    let reentrantConnection: ConnectableConnection | undefined;
    let result: ConnectableObservableType<number>;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = connectable(source);

    result.subscribe((value) => {
      values.push(value);
      if (!reentrantConnection) {
        reentrantConnection = result.connect();
      }
    });
    const connection = result.connect();

    expect(sourceActivations).toBe(1);
    expect(reentrantConnection).toBe(connection);
    expect(connection.closed).toBe(true);
    expect(values).toEqual([1, 2]);
  });

  it('keeps a reset connector hidden from late observers until the prior platform observer run ends', () => {
    const source = tracked<number>();
    const result = connectable(source.observable);
    const firstController = new AbortController();
    const lateController = new AbortController();
    const freshController = new AbortController();
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const freshValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    firstConnection.unsubscribe();

    result.subscribe((value) => lateValues.push(value), { signal: lateController.signal });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);

    expect(firstValues).toEqual([1]);
    expect(lateValues).toEqual([]);

    firstController.abort();
    lateController.abort();
    result.subscribe((value) => freshValues.push(value), { signal: freshController.signal });
    source.subscribers[1]!.next(3);

    expect(freshValues).toEqual([3]);

    secondConnection.unsubscribe();
    freshController.abort();
  });
});

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
