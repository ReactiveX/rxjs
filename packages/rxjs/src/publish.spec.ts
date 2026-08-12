import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type PublishSymbol = typeof import('./publish.js').publish;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;
type ColdObservableCtor = typeof import('./cold-observable.js').ColdObservable;

let publish: PublishSymbol;
let ColdObservable: ColdObservableCtor;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'publish' in Observable.prototype;
  ({ publish } = await import('./publish.js'));
  ({ ColdObservable } = await import('./cold-observable.js'));
});

describe('publish', () => {
  it('installs only its exact unique Symbol and preserves the manual and selector overloads', () => {
    const source = Observable.from([1, 2]);
    const manual = source[publish]();
    const selected = source[publish]((shared) => {
      expectTypeOf(shared).toEqualTypeOf<Observable<number>>();
      return Promise.resolve({ selected: true });
    });
    const otherKey = Symbol('publish');
    type HasStringNamedPublish = 'publish' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(manual).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(selected).toEqualTypeOf<Observable<{ selected: boolean }>>();
    expectTypeOf<HasStringNamedPublish>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('publish' in Observable.prototype).toBe(false);
    expect('refCount' in manual).toBe(false);
    expect(publish.description).toBe('publish');
    expect(Symbol.keyFor(publish)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A selector must return an ObservableValue.
      source[publish](() => 1);
      // @ts-expect-error The selector receives the source value type.
      source[publish]((shared: Observable<string>) => shared);
    }
  });

  it('does not activate the source before manual connection', () => {
    const source = tracked<number>();
    const result = source.observable[publish]();
    const values: number[] = [];

    result.subscribe((value) => values.push(value));

    expect(source.activations).toBe(0);
    expect(values).toEqual([]);
  });

  it('multicasts one manual source connection to concurrent observers', () => {
    const source = tracked<number>();
    const result = source.observable[publish]();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    result.subscribe((value) => secondValues.push(value));
    const connection = result.connect();
    const sameConnection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);

    expect(connection).toBe(sameConnection);
    expect(source.activations).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(secondValues).toEqual([1, 2]);

    connection.unsubscribe();
  });

  it('cancels manual source work without terminally notifying observers on explicit disconnect', () => {
    const source = tracked<number>();
    const result = source.observable[publish]();
    const terminals: string[] = [];

    result.subscribe({
      complete: () => terminals.push('complete'),
      error: () => terminals.push('error'),
    });
    const connection = result.connect();
    connection.unsubscribe();

    expect(connection.closed).toBe(true);
    expect(source.subscribers[0]!.active).toBe(false);
    expect(terminals).toEqual([]);
  });

  it('retains its single Subject after terminal, matching legacy publish reconnect behavior', () => {
    const source = tracked<number>();
    const result = source.observable[publish]();
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const lateTerminals: string[] = [];

    result.subscribe((value) => firstValues.push(value));
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    result.subscribe({
      next: (value) => lateValues.push(value),
      complete: () => lateTerminals.push('complete'),
    });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);
    source.subscribers[1]!.complete();

    expect(firstConnection.closed).toBe(true);
    expect(secondConnection.closed).toBe(true);
    expect(source.activations).toBe(2);
    expect(firstValues).toEqual([1]);
    expect(lateValues).toEqual([]);
    expect(lateTerminals).toEqual(['complete']);
  });

  it('forwards manual source completion and error through the retained Subject', () => {
    const completingSource = tracked<number>();
    const completing = completingSource.observable[publish]();
    const completionEvents: string[] = [];

    completing.subscribe({ complete: () => completionEvents.push('complete') });
    const completedConnection = completing.connect();
    completingSource.subscribers[0]!.complete();

    const failure = new Error('source failed');
    const failingSource = tracked<number>();
    const failing = failingSource.observable[publish]();
    const errors: unknown[] = [];

    failing.subscribe({ error: (error) => errors.push(error) });
    const failedConnection = failing.connect();
    failingSource.subscribers[0]!.error(failure);

    expect(completionEvents).toEqual(['complete']);
    expect(completedConnection.closed).toBe(true);
    expect(errors).toEqual([failure]);
    expect(failedConnection.closed).toBe(true);
  });

  it('prewires selector subscriptions before one synchronous source connection', () => {
    const events: string[] = [];
    let sourceActivations = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      events.push('source active');
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    const values: string[] = [];

    source[publish]((shared) => {
      events.push('selector');
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
            next: (value) => subscriber.next(`first ${value}`),
            error: (error) => subscriber.error(error),
            complete,
          },
          { signal: subscriber.signal }
        );
        shared.subscribe(
          {
            next: (value) => subscriber.next(`second ${value}`),
            error: (error) => subscriber.error(error),
            complete,
          },
          { signal: subscriber.signal }
        );
      });
    }).subscribe((value) => values.push(value));

    expect(sourceActivations).toBe(1);
    expect(events).toEqual(['selector', 'selector result active', 'source active']);
    expect(values).toEqual(['first 1', 'second 1', 'first 2', 'second 2']);
  });

  it('shares and ref-counts each selector run, then restarts with a fresh Subject', () => {
    const source = tracked<number>();
    const result = source.observable[publish]((shared) => shared);
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

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);

    result.subscribe((value) => restartedValues.push(value), { signal: restartController.signal });
    source.subscribers[1]!.next(3);

    expect(source.activations).toBe(2);
    expect(restartedValues).toEqual([3]);

    restartController.abort();
  });

  it('publishes a manual connection before synchronous reentrant fanout', () => {
    let sourceActivations = 0;
    let result: ConnectableObservableType<number>;
    let reentrantConnection: ReturnType<ConnectableObservableType<number>['connect']> | undefined;
    const values: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = source[publish]();

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

  it('creates referentially independent manual results', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    const source = new ColdObservable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
    });
    const first = source[publish]();
    const second = source[publish]();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    first.subscribe((value) => firstValues.push(value));
    second.subscribe((value) => secondValues.push(value));
    const firstConnection = first.connect();
    const secondConnection = second.connect();
    sourceSubscribers[0]!.next(1);
    sourceSubscribers[1]!.next(2);

    expect(sourceSubscribers).toHaveLength(2);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([2]);

    firstConnection.unsubscribe();
    secondConnection.unsubscribe();
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
