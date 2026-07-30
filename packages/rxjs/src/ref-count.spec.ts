import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type RefCountSymbol = typeof import('./ref-count.js').refCount;
type ConnectableModule = typeof import('./connectable.js');
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;
type MulticastSymbol = typeof import('./multicast.js').multicast;
type SubjectCtor = typeof import('./subject.js').Subject;
type SubjectLike<T> = import('./util/types.js').SubjectLike<T>;

let refCount: RefCountSymbol;
let connectable: ConnectableModule['connectable'];
let multicast: MulticastSymbol;
let Subject: SubjectCtor;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'refCount' in Observable.prototype;
  ({ refCount } = await import('./ref-count.js'));
  ({ connectable } = await import('./connectable.js'));
  ({ multicast } = await import('./multicast.js'));
  ({ Subject } = await import('./subject.js'));
});

describe('refCount', () => {
  it('installs only its exact Symbol and accepts concrete connectable and manual multicast results', () => {
    const source = new Observable<number>(() => {});
    const concrete = connectable(source);
    const manual = source[multicast](() => new Subject<number>());
    const concreteResult = concrete[refCount]();
    const manualResult = manual[refCount]();
    const otherKey = Symbol('refCount');
    type HasStringNamedRefCount = 'refCount' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(concreteResult).toEqualTypeOf<Observable<number>>();
    expectTypeOf(manualResult).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedRefCount>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('refCount' in Observable.prototype).toBe(false);
    expect(refCount.description).toBe('refCount');
    expect(Symbol.keyFor(refCount)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
    expect(() => (source as unknown as ConnectableObservableType<number>)[refCount]()).toThrow('refCount requires a ConnectableObservable');

    if (false) {
      // @ts-expect-error refCount requires the concrete ConnectableObservable receiver.
      source[refCount]();
    }
  });

  it('subscribes to the connectable before connecting its synchronous source', () => {
    const events: string[] = [];
    const values: number[] = [];
    const destination = new Subject<number>();
    const subject: SubjectLike<number> = {
      get active() {
        return destination.active;
      },
      subscribe(observer, options) {
        events.push('connectable subscribed');
        destination.subscribe(observer, options);
      },
      next(value) {
        destination.next(value);
      },
      error(error) {
        destination.error(error);
      },
      complete() {
        destination.complete();
      },
    };
    const source = new Observable<number>((subscriber) => {
      events.push('source connected');
      subscriber.next(1);
      subscriber.complete();
    });

    connectable(source, { connector: () => subject })
      [refCount]()
      .subscribe((value) => values.push(value));

    expect(events).toEqual(['connectable subscribed', 'source connected']);
    expect(values).toEqual([1]);
  });

  it('shares one platform run across concurrent and late observers, disconnects on the final abort, and restarts', () => {
    const source = tracked<number>();
    const connector = vi.fn(() => new Subject<number>());
    const result = connectable(source.observable, { connector })[refCount]();
    const firstController = new AbortController();
    const lateController = new AbortController();
    const restartController = new AbortController();
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const restartValues: number[] = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    source.subscribers[0]!.next(1);
    result.subscribe((value) => lateValues.push(value), { signal: lateController.signal });
    source.subscribers[0]!.next(2);

    expect(source.activations).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(lateValues).toEqual([2]);

    firstController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    source.subscribers[0]!.next(3);
    expect(lateValues).toEqual([2, 3]);

    lateController.abort();
    expect(source.subscribers[0]!.active).toBe(false);

    result.subscribe((value) => restartValues.push(value), { signal: restartController.signal });
    source.subscribers[1]!.next(4);

    expect(source.activations).toBe(2);
    expect(restartValues).toEqual([4]);
    expect(connector).toHaveBeenCalledTimes(2);

    restartController.abort();
  });

  it('shares ref-count state between separate views of the same connectable', () => {
    const source = tracked<number>();
    const shared = connectable(source.observable);
    const firstResult = shared[refCount]();
    const secondResult = shared[refCount]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    firstResult.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    secondResult.subscribe((value) => secondValues.push(value), { signal: secondController.signal });
    source.subscribers[0]!.next(1);

    expect(source.activations).toBe(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    firstController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    source.subscribers[0]!.next(2);
    expect(secondValues).toEqual([1, 2]);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);
  });

  it('does not double-connect during synchronous reentrant subscription and restarts after completion', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const firstValues: number[] = [];
    const reentrantValues: number[] = [];
    const restartedValues: number[] = [];
    let subscribedReentrantly = false;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.addTeardown(() => sourceTeardowns++);
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    const result = connectable(source, { connector: () => new Subject<number>() })[refCount]();

    result.subscribe((value) => {
      firstValues.push(value);
      if (!subscribedReentrantly) {
        subscribedReentrantly = true;
        result.subscribe((innerValue) => reentrantValues.push(innerValue));
      }
    });

    expect(sourceActivations).toBe(1);
    expect(sourceTeardowns).toBe(1);
    expect(firstValues).toEqual([1, 2]);
    expect(reentrantValues).toEqual([2]);

    result.subscribe((value) => restartedValues.push(value));

    expect(sourceActivations).toBe(2);
    expect(sourceTeardowns).toBe(2);
    expect(restartedValues).toEqual([1, 2]);
  });

  it('disconnects an in-flight synchronous source when its final observer aborts', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const values: number[] = [];
    const controller = new AbortController();
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.addTeardown(() => sourceTeardowns++);
      subscriber.next(1);
      if (subscriber.active) {
        subscriber.next(2);
      }
    });
    const result = connectable(source)[refCount]();

    result.subscribe(
      (value) => {
        values.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(sourceActivations).toBe(1);
    expect(sourceTeardowns).toBe(1);
    expect(values).toEqual([1]);
  });

  it('cleans up a synchronous error and restarts with a factory connector', () => {
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    const restartedValues: number[] = [];
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.addTeardown(() => sourceTeardowns++);
      if (sourceActivations === 1) {
        subscriber.error(failure);
      } else {
        subscriber.next(2);
        subscriber.complete();
      }
    });
    const result = connectable(source, { connector: () => new Subject<number>() })[refCount]();

    result.subscribe({ error: (error) => errors.push(error) });
    result.subscribe((value) => restartedValues.push(value));

    expect(errors).toEqual([failure]);
    expect(restartedValues).toEqual([2]);
    expect(sourceActivations).toBe(2);
    expect(sourceTeardowns).toBe(2);
  });

  it('does not reconnect a manual multicast subject after that subject terminates', () => {
    const source = tracked<number>();
    const result = source.observable[multicast](new Subject<number>())[refCount]();
    const firstValues: number[] = [];
    const lateEvents: string[] = [];

    result.subscribe((value) => firstValues.push(value));
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    result.subscribe({
      next: () => lateEvents.push('next'),
      complete: () => lateEvents.push('complete'),
    });

    expect(firstValues).toEqual([1]);
    expect(lateEvents).toEqual(['complete']);
    expect(source.activations).toBe(1);
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
