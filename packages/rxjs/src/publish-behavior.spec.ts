import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type PublishBehaviorSymbol = typeof import('./publish-behavior.js').publishBehavior;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;

let publishBehavior: PublishBehaviorSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'publishBehavior' in Observable.prototype;
  ({ publishBehavior } = await import('./publish-behavior.js'));
});

describe('publishBehavior', () => {
  it('installs only its exact Symbol and exposes only the pinned initial-value overload', () => {
    const source = new Observable<number>(() => {});
    const result = source[publishBehavior](0);
    const otherKey = Symbol('publishBehavior');
    type HasStringNamedPublishBehavior = 'publishBehavior' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(result).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf<HasStringNamedPublishBehavior>().toEqualTypeOf<false>();
    expect(result).toBeInstanceOf(Observable);
    expect(typeof result.connect).toBe('function');
    expect(hadStringMethod).toBe(false);
    expect('publishBehavior' in Observable.prototype).toBe(false);
    expect(publishBehavior.description).toBe('publishBehavior');
    expect(Symbol.keyFor(publishBehavior)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error The initial value must match the source value type.
      source[publishBehavior]('zero');
      // @ts-expect-error RxJS 7 publishBehavior never supported a selector overload.
      source[publishBehavior](0, (shared: Observable<number>) => shared);
    }
  });

  it('replays the initial value without activating the source and starts only on manual connect', () => {
    const source = tracked<number>();
    const result = source.observable[publishBehavior](0);
    const values: number[] = [];

    result.subscribe((value) => values.push(value));

    expect(values).toEqual([0]);
    expect(source.activations).toBe(0);

    const connection = result.connect();
    source.subscribers[0]!.next(1);

    expect(values).toEqual([0, 1]);
    expect(source.activations).toBe(1);

    connection.unsubscribe();
  });

  it('retains one BehaviorSubject and its current value across manual disconnects', () => {
    const source = tracked<number>();
    const result = source.observable[publishBehavior](0);
    const firstValues: number[] = [];
    const freshValues: number[] = [];
    const firstController = new AbortController();
    const freshController = new AbortController();

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    firstConnection.unsubscribe();

    expect(firstConnection.closed).toBe(true);
    expect(source.subscribers[0]!.active).toBe(false);
    expect(firstValues).toEqual([0, 1]);

    firstController.abort();
    result.subscribe((value) => freshValues.push(value), { signal: freshController.signal });

    expect(freshValues).toEqual([1]);

    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);

    expect(secondConnection).not.toBe(firstConnection);
    expect(source.activations).toBe(2);
    expect(freshValues).toEqual([1, 2]);

    secondConnection.unsubscribe();
    freshController.abort();
  });

  it('shares live values while a late platform observer joins without replaying the current value', () => {
    const source = tracked<number>();
    const result = source.observable[publishBehavior](0);
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const firstController = new AbortController();
    const lateController = new AbortController();

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    result.subscribe((value) => lateValues.push(value), { signal: lateController.signal });
    source.subscribers[0]!.next(2);

    expect(firstValues).toEqual([0, 1, 2]);
    expect(lateValues).toEqual([2]);

    connection.unsubscribe();
    firstController.abort();
    lateController.abort();
  });

  it('retains completion and gives late observers only the terminal notification', () => {
    const source = tracked<number>();
    const result = source.observable[publishBehavior](0);
    const firstValues: number[] = [];
    const firstTerminals: string[] = [];
    const lateValues: number[] = [];
    const lateTerminals: string[] = [];

    result.subscribe({
      next: (value) => firstValues.push(value),
      complete: () => firstTerminals.push('complete'),
    });
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
    expect(firstValues).toEqual([0, 1]);
    expect(firstTerminals).toEqual(['complete']);
    expect(lateValues).toEqual([]);
    expect(lateTerminals).toEqual(['complete']);
  });

  it('retains errors and gives late observers the same error without replaying a value', () => {
    const failure = new Error('source failed');
    const source = tracked<number>();
    const result = source.observable[publishBehavior](0);
    const firstValues: number[] = [];
    const firstErrors: unknown[] = [];
    const lateValues: number[] = [];
    const lateErrors: unknown[] = [];

    result.subscribe({
      next: (value) => firstValues.push(value),
      error: (error) => firstErrors.push(error),
    });
    const connection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.error(failure);

    result.subscribe({
      next: (value) => lateValues.push(value),
      error: (error) => lateErrors.push(error),
    });

    expect(connection.closed).toBe(true);
    expect(firstValues).toEqual([0, 1]);
    expect(firstErrors).toEqual([failure]);
    expect(lateValues).toEqual([]);
    expect(lateErrors).toEqual([failure]);
  });

  it('publishes one connection before synchronous reentrant source fanout', () => {
    let sourceActivations = 0;
    let result: ConnectableObservableType<number>;
    let reentrantConnection: ReturnType<ConnectableObservableType<number>['connect']> | undefined;
    const firstValues: number[] = [];
    const reentrantValues: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = source[publishBehavior](0);

    result.subscribe((value) => {
      firstValues.push(value);
      if (value === 1) {
        reentrantConnection = result.connect();
        result.subscribe((innerValue) => reentrantValues.push(innerValue));
      }
    });
    const connection = result.connect();

    expect(sourceActivations).toBe(1);
    expect(reentrantConnection).toBe(connection);
    expect(connection.closed).toBe(true);
    expect(firstValues).toEqual([0, 1, 2]);
    expect(reentrantValues).toEqual([2]);
  });

  it('keeps a manual source connection alive when the final observer cancels', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const values: number[] = [];
    const lateValues: number[] = [];
    const controller = new AbortController();
    const lateController = new AbortController();
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.addTeardown(() => sourceTeardowns++);
      subscriber.next(1);
      if (subscriber.active) {
        subscriber.next(2);
      }
    });
    const result = source[publishBehavior](0);

    result.subscribe(
      (value) => {
        values.push(value);
        if (value === 1) {
          controller.abort();
        }
      },
      { signal: controller.signal }
    );
    const connection = result.connect();

    expect(sourceActivations).toBe(1);
    expect(sourceTeardowns).toBe(0);
    expect(connection.closed).toBe(false);
    expect(values).toEqual([0, 1]);

    result.subscribe((value) => lateValues.push(value), { signal: lateController.signal });
    expect(lateValues).toEqual([2]);

    connection.unsubscribe();
    expect(sourceTeardowns).toBe(1);
    lateController.abort();
  });

  it('creates an independent retained BehaviorSubject for each published result', () => {
    const source = new Observable<number>(() => {});
    const first = source[publishBehavior](0);
    const second = source[publishBehavior](10);
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    first.subscribe((value) => firstValues.push(value));
    second.subscribe((value) => secondValues.push(value));

    expect(firstValues).toEqual([0]);
    expect(secondValues).toEqual([10]);
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
