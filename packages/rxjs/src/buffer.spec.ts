import { describe, expect, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { buffer } from './buffer.js';

describe('buffer', () => {
  it('uses an exact module-owned Symbol rather than the global registry', () => {
    expect(buffer.description).toBe('buffer');
    expect(Symbol.keyFor(buffer)).toBeUndefined();
  });

  it('preserves delay-window buffering when count windows are not configured', () => {
    let sourceSubscriber: Subscriber<string> | undefined;
    let closingSubscriber: Subscriber<void> | undefined;
    const results: string[][] = [];
    const source = new Observable<string>((subscriber) => {
      sourceSubscriber = subscriber;
    });
    const closingNotifier = new Observable<void>((subscriber) => {
      closingSubscriber = subscriber;
    });

    source[buffer]({ delay: () => closingNotifier }).subscribe((value) => results.push(value));
    sourceSubscriber?.next('a');
    sourceSubscriber?.next('b');
    closingSubscriber?.next(undefined);

    expect(results).toEqual([['a', 'b']]);
  });

  it('restarts the delay selector after each boundary by default', () => {
    const source = controllable<string>();
    const notifier = controllable<void>();
    const controller = new AbortController();
    const results: string[][] = [];

    source.observable[buffer]({ delay: () => notifier.observable }).subscribe((value) => results.push(value), {
      signal: controller.signal,
    });
    source.subscriber.next('a');
    notifier.subscriber.next(undefined);
    source.subscriber.next('b');
    notifier.subscriber.next(undefined);

    expect(results).toEqual([['a'], ['b']]);
    expect(notifier.subscriptions).toBe(3);
    expect(notifier.teardowns).toBe(2);

    controller.abort();
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(3);
  });

  it('keeps a persistent delay notifier active across boundaries and closes it on source completion', () => {
    const source = controllable<string>();
    const notifier = controllable<void>();
    const results: Array<string[] | 'complete'> = [];

    source.observable[buffer]({
      delay: () => notifier.observable,
      emitEmpty: true,
      emitRemainingOnError: false,
      restartDelay: false,
    }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    source.subscriber.next('a');
    notifier.subscriber.next(undefined);
    notifier.subscriber.next(undefined);
    source.subscriber.next('b');
    source.subscriber.complete();

    expect(results).toEqual([['a'], [], ['b'], 'complete']);
    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriptions).toBe(1);
    expect(notifier.teardowns).toBe(1);
    expect(notifier.subscriber.active).toBe(false);
  });

  it('discards the active delay window and closes the source when the notifier errors', () => {
    const source = controllable<string>();
    const notifier = controllable<void>();
    const notifierError = new Error('notifier failure');
    const results: string[][] = [];
    const errors: unknown[] = [];

    source.observable[buffer]({
      delay: () => notifier.observable,
      emitEmpty: true,
      emitRemainingOnError: false,
      restartDelay: false,
    }).subscribe({
      next: (value) => results.push(value),
      error: (error) => errors.push(error),
    });
    source.subscriber.next('a');
    notifier.subscriber.error(notifierError);

    expect(results).toEqual([]);
    expect(errors).toEqual([notifierError]);
    expect(source.teardowns).toBe(1);
    expect(source.subscriber.active).toBe(false);
  });

  it('shares a persistent notifier and cancels both inputs after the last observer leaves', () => {
    const source = controllable<string>();
    const notifier = controllable<void>();
    const buffered = source.observable[buffer]({
      delay: () => notifier.observable,
      emitEmpty: true,
      emitRemainingOnError: false,
      restartDelay: false,
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: string[][] = [];
    const secondResults: string[][] = [];

    buffered.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    buffered.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    source.subscriber.next('a');
    notifier.subscriber.next(undefined);

    expect(source.subscriptions).toBe(1);
    expect(notifier.subscriptions).toBe(1);
    expect(firstResults).toEqual([['a']]);
    expect(secondResults).toEqual([['a']]);

    firstController.abort();
    expect(source.teardowns).toBe(0);
    expect(notifier.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(notifier.teardowns).toBe(1);
    expect(source.subscriber.active).toBe(false);
    expect(notifier.subscriber.active).toBe(false);
  });

  it('can discard the active delay window when the source errors', () => {
    const results: string[][] = [];
    const sourceError = new Error('source failure');
    let receivedError: unknown;
    let notifierTeardowns = 0;
    const source = new Observable<string>((subscriber) => {
      subscriber.next('a');
      subscriber.next('b');
      subscriber.error(sourceError);
    });
    const closingNotifier = new Observable<void>((subscriber) => {
      subscriber.addTeardown(() => {
        notifierTeardowns++;
      });
    });

    source[buffer]({
      delay: () => closingNotifier,
      emitEmpty: true,
      emitRemainingOnError: false,
    }).subscribe({
      next: (value) => results.push(value),
      error: (error) => {
        receivedError = error;
      },
    });

    expect(results).toEqual([]);
    expect(receivedError).toBe(sourceError);
    expect(notifierTeardowns).toBe(1);
  });

  it('does not activate source work when the delay selector throws synchronously', () => {
    const selectorError = new Error('selector failure');
    let sourceActivations = 0;
    let receivedError: unknown;
    const source = new Observable<string>(() => {
      sourceActivations++;
    });

    source[buffer]({
      delay: () => {
        throw selectorError;
      },
      emitEmpty: true,
      emitRemainingOnError: false,
    }).subscribe({
      error: (error) => {
        receivedError = error;
      },
    });

    expect(sourceActivations).toBe(0);
    expect(receivedError).toBe(selectorError);
  });

  it('supports overlapping count windows and emits completion partials in creation order', () => {
    const results: (string[] | 'complete')[] = [];
    const source = new Observable<string>((subscriber) => {
      for (const value of ['a', 'b', 'c', 'd', 'e']) {
        subscriber.next(value);
      }
      subscriber.complete();
    });

    source[buffer]({ maxSize: 3, startEvery: 1 }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([['a', 'b', 'c'], ['b', 'c', 'd'], ['c', 'd', 'e'], ['d', 'e'], ['e'], 'complete']);
  });

  it('supports gaps between count windows', () => {
    const results: string[][] = [];
    const source = Observable.from(['a', 'b', 'c', 'd', 'e']);

    source[buffer]({ maxSize: 2, startEvery: 3 }).subscribe((value) => results.push(value));

    expect(results).toEqual([
      ['a', 'b'],
      ['d', 'e'],
    ]);
  });

  it('can discard partial count windows when the source errors', () => {
    const results: string[][] = [];
    const sourceError = new Error('source failure');
    let receivedError: unknown;
    const source = new Observable<string>((subscriber) => {
      subscriber.next('a');
      subscriber.next('b');
      subscriber.error(sourceError);
    });

    source[buffer]({ maxSize: 3, startEvery: 1, emitRemainingOnError: false }).subscribe({
      next: (value) => results.push(value),
      error: (error) => {
        receivedError = error;
      },
    });

    expect(results).toEqual([]);
    expect(receivedError).toBe(sourceError);
  });

  it('shares count-window work and cancels upstream when the last observer aborts', () => {
    let sourceSubscriber: Subscriber<string> | undefined;
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const source = new Observable<string>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => {
        sourceTeardowns++;
      });
    });
    const buffered = source[buffer]({ maxSize: 2, startEvery: 1 });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: string[][] = [];
    const secondResults: string[][] = [];

    buffered.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    buffered.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next('a');
    sourceSubscriber?.next('b');

    expect(sourceActivations).toBe(1);
    expect(firstResults).toEqual([['a', 'b']]);
    expect(secondResults).toEqual([['a', 'b']]);

    firstController.abort();
    expect(sourceTeardowns).toBe(0);

    secondController.abort();
    expect(sourceTeardowns).toBe(1);
    expect(sourceSubscriber?.active).toBe(false);
  });
});

function controllable<T>(): {
  observable: Observable<T>;
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
        throw new Error('Expected source activation.');
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
