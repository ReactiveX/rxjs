import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type PublishLastSymbol = typeof import('./publish-last.js').publishLast;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;

let publishLast: PublishLastSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'publishLast' in Observable.prototype;
  ({ publishLast } = await import('./publish-last.js'));
});

describe('publishLast', () => {
  it('installs only its exact unique Symbol and exposes only the no-argument connectable overload', () => {
    const source = Observable.from([1, 2]);
    const result = source[publishLast]();
    const otherKey = Symbol('publishLast');
    type HasStringNamedPublishLast = 'publishLast' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf<HasStringNamedPublishLast>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('publishLast' in Observable.prototype).toBe(false);
    expect('refCount' in result).toBe(false);
    expect(publishLast.description).toBe('publishLast');
    expect(Symbol.keyFor(publishLast)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error publishLast has never accepted a selector.
      source[publishLast]((shared: Observable<number>) => shared);
    }
  });

  it('does not activate or emit before manual connection', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const values: number[] = [];

    result.subscribe((value) => values.push(value));

    expect(source.activations).toBe(0);
    expect(values).toEqual([]);
  });

  it('multicasts only the final source value to every observer when the source completes', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const firstEvents: Array<number | 'complete'> = [];
    const secondEvents: Array<number | 'complete'> = [];

    result.subscribe({
      next: (value) => firstEvents.push(value),
      complete: () => firstEvents.push('complete'),
    });
    result.subscribe({
      next: (value) => secondEvents.push(value),
      complete: () => secondEvents.push('complete'),
    });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);

    expect(firstEvents).toEqual([]);
    expect(secondEvents).toEqual([]);

    source.subscribers[0]!.complete();

    expect(firstEvents).toEqual([2, 'complete']);
    expect(secondEvents).toEqual([2, 'complete']);
    expect(connection.closed).toBe(true);
  });

  it('completes without a value for an empty source', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const events: Array<number | 'complete'> = [];

    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    const connection = result.connect();
    source.subscribers[0]!.complete();

    expect(events).toEqual(['complete']);
    expect(connection.closed).toBe(true);
  });

  it('errors without emitting the buffered value and retains that error for late observers', () => {
    const failure = new Error('source failed');
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const firstEvents: unknown[] = [];
    const lateEvents: unknown[] = [];

    result.subscribe({
      next: (value) => firstEvents.push(value),
      error: (error) => firstEvents.push(['error', error]),
    });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.error(failure);

    result.subscribe({
      next: (value) => lateEvents.push(value),
      error: (error) => lateEvents.push(['error', error]),
    });

    expect(firstEvents).toEqual([['error', failure]]);
    expect(lateEvents).toEqual([['error', failure]]);
    expect(connection.closed).toBe(true);
  });

  it('retains and replays the final value and completion to late observers', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const firstEvents: Array<number | 'complete'> = [];
    const lateEvents: Array<number | 'complete'> = [];

    result.subscribe({
      next: (value) => firstEvents.push(value),
      complete: () => firstEvents.push('complete'),
    });
    result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.next(2);
    source.subscribers[0]!.complete();

    result.subscribe({
      next: (value) => lateEvents.push(value),
      complete: () => lateEvents.push('complete'),
    });
    const secondConnection = result.connect();
    source.subscribers[1]!.next(3);
    source.subscribers[1]!.complete();

    expect(firstEvents).toEqual([2, 'complete']);
    expect(lateEvents).toEqual([2, 'complete']);
    expect(secondConnection.closed).toBe(true);
  });

  it('emits nothing on explicit disconnect and can update the retained pending subject after reconnect', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const events: Array<number | 'complete'> = [];

    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    firstConnection.unsubscribe();

    expect(events).toEqual([]);
    expect(firstConnection.closed).toBe(true);
    expect(source.subscribers[0]!.active).toBe(false);

    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);
    source.subscribers[1]!.complete();

    expect(events).toEqual([2, 'complete']);
    expect(secondConnection.closed).toBe(true);
  });

  it('keeps a manual connection alive when an observer cancels and delivers the final value to remaining observers', () => {
    const source = tracked<number>();
    const result = source.observable[publishLast]();
    const firstController = new AbortController();
    const firstValues: number[] = [];
    const secondEvents: Array<number | 'complete'> = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    firstController.abort();

    expect(connection.closed).toBe(false);
    expect(source.subscribers[0]!.active).toBe(true);

    result.subscribe({
      next: (value) => secondEvents.push(value),
      complete: () => secondEvents.push('complete'),
    });
    source.subscribers[0]!.next(2);
    source.subscribers[0]!.complete();

    expect(firstValues).toEqual([]);
    expect(secondEvents).toEqual([2, 'complete']);
    expect(connection.closed).toBe(true);
  });

  it('publishes the connection before synchronous final-value reentrancy', () => {
    let sourceActivations = 0;
    let result: ConnectableObservableType<number>;
    let reentrantConnection: ReturnType<ConnectableObservableType<number>['connect']> | undefined;
    const events: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = source[publishLast]();

    result.subscribe({
      next: (value) => {
        events.push(value);
        reentrantConnection = result.connect();
      },
      complete: () => events.push('complete'),
    });
    const connection = result.connect();

    expect(sourceActivations).toBe(1);
    expect(reentrantConnection).toBe(connection);
    expect(connection.closed).toBe(true);
    expect(events).toEqual([2, 'complete']);
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
