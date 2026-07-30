import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type MulticastSymbol = typeof import('./multicast.js').multicast;
type ConnectableObservableType<T> = import('./connectable.js').ConnectableObservable<T>;
type SubjectCtor = typeof import('./subject.js').Subject;
type ReplaySubjectFactory = typeof import('./replay-subject.js').replaySubject;

let multicast: MulticastSymbol;
let Subject: SubjectCtor;
let replaySubject: ReplaySubjectFactory;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'multicast' in Observable.prototype;
  ({ multicast } = await import('./multicast.js'));
  ({ Subject } = await import('./subject.js'));
  ({ replaySubject } = await import('./replay-subject.js'));
});

describe('multicast', () => {
  it('installs only its exact unique Symbol and preserves the subject, factory, and selector overloads', () => {
    const source = Observable.from([1, 2]);
    const subject = new Subject<number>();
    const fromSubject = source[multicast](subject);
    const fromFactory = source[multicast](() => new Subject<number>());
    const selectedSubject = source[multicast](subject, (shared) => {
      expectTypeOf(shared).toEqualTypeOf<Observable<number>>();
      return Promise.resolve('selected');
    });
    const selectedFactory = source[multicast](
      () => new Subject<number>(),
      (shared) => shared
    );
    const otherKey = Symbol('multicast');
    type HasStringNamedMulticast = 'multicast' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(fromSubject).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(fromFactory).toEqualTypeOf<ConnectableObservableType<number>>();
    expectTypeOf(selectedSubject).toEqualTypeOf<Observable<string>>();
    expectTypeOf(selectedFactory).toEqualTypeOf<Observable<number>>();
    expectTypeOf<HasStringNamedMulticast>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('multicast' in Observable.prototype).toBe(false);
    expect(multicast.description).toBe('multicast');
    expect(Symbol.keyFor(multicast)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A subject or subject factory is required.
      source[multicast]();
      // @ts-expect-error The first argument must be a SubjectLike or factory.
      source[multicast](source);
      // @ts-expect-error A selector must return an ObservableValue.
      source[multicast](subject, () => 1);
      // @ts-expect-error The factory subject value type must match the source.
      source[multicast](() => new Subject<string>());
    }
  });

  it('returns a manually connectable result for a subject instance and fans out one source connection', () => {
    const source = tracked<number>();
    const subject = new Subject<number>();
    const result = source.observable[multicast](subject);
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    result.subscribe((value) => secondValues.push(value));

    expect(source.activations).toBe(0);

    const connection = result.connect();
    const sameConnection = result.connect();
    source.subscribers[0]!.next(1);

    expect(connection).toBe(sameConnection);
    expect(source.activations).toBe(1);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([1]);

    connection.unsubscribe();
    expect(source.subscribers[0]!.active).toBe(false);
  });

  it('creates a fresh factory subject after terminal and reconnects later observers', () => {
    const source = tracked<number>();
    const subjectFactory = vi.fn(() => new Subject<number>());
    const result = source.observable[multicast](subjectFactory);
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    const firstConnection = result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    result.subscribe((value) => secondValues.push(value));
    const secondConnection = result.connect();
    source.subscribers[1]!.next(2);

    expect(firstConnection.closed).toBe(true);
    expect(secondConnection).not.toBe(firstConnection);
    expect(subjectFactory).toHaveBeenCalledTimes(2);
    expect(firstValues).toEqual([1]);
    expect(secondValues).toEqual([2]);

    secondConnection.unsubscribe();
  });

  it('retains the supplied subject instance across reset attempts', () => {
    const source = tracked<number>();
    const subject = replaySubject<number>({ size: 1 });
    const result = source.observable[multicast](subject);
    const firstValues: number[] = [];
    const lateValues: number[] = [];

    result.subscribe((value) => firstValues.push(value));
    result.connect();
    source.subscribers[0]!.next(1);
    source.subscribers[0]!.complete();

    result.subscribe((value) => lateValues.push(value));
    const secondConnection = result.connect();

    expect(firstValues).toEqual([1]);
    expect(lateValues).toEqual([1]);
    expect(secondConnection.closed).toBe(false);

    source.subscribers[1]!.complete();
    expect(secondConnection.closed).toBe(true);
  });

  it('routes selector overloads through one prewired multicast connection', () => {
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

    source[multicast](new Subject<number>(), (shared) => {
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

  it('shares and ref-counts a selector run, cancels on the final observer, and restarts with a fresh factory subject', () => {
    const source = tracked<number>();
    const subjectFactory = vi.fn(() => new Subject<number>());
    const result = source.observable[multicast](subjectFactory, (shared) => shared);
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

    expect(subjectFactory).toHaveBeenCalledTimes(2);
    expect(source.activations).toBe(2);
    expect(restartedValues).toEqual([3]);

    restartController.abort();
  });

  it('forwards manual source completion and error through the subject and closes each connection', () => {
    const completingSource = tracked<number>();
    const completing = completingSource.observable[multicast](() => new Subject<number>());
    const completionEvents: string[] = [];

    completing.subscribe({ complete: () => completionEvents.push('complete') });
    const completedConnection = completing.connect();
    completingSource.subscribers[0]!.complete();

    const failure = new Error('source failed');
    const failingSource = tracked<number>();
    const failing = failingSource.observable[multicast](() => new Subject<number>());
    const errors: unknown[] = [];

    failing.subscribe({ error: (error) => errors.push(error) });
    const failedConnection = failing.connect();
    failingSource.subscribers[0]!.error(failure);

    expect(completionEvents).toEqual(['complete']);
    expect(completedConnection.closed).toBe(true);
    expect(errors).toEqual([failure]);
    expect(failedConnection.closed).toBe(true);
  });

  it('publishes a manual connection before synchronous reentrant fanout', () => {
    let sourceActivations = 0;
    let reentrantConnection: ReturnType<ConnectableObservableType<number>['connect']> | undefined;
    let result: ConnectableObservableType<number>;
    const values: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });
    result = source[multicast](() => new Subject<number>());

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
