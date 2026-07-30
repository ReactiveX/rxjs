import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { zip } from './zip.js';

describe('zip', () => {
  it('completes immediately when no sources are provided', () => {
    const events: string[] = [];

    zip([]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
  });

  it('stops activating later sources after a synchronous empty source', () => {
    const activations: string[] = [];
    const empty = new Observable<never>((subscriber) => {
      activations.push('empty');
      subscriber.complete();
    });
    const sibling = new Observable<number>((subscriber) => {
      activations.push('sibling');
      subscriber.next(1);
    });
    const events: string[] = [];

    zip([empty, sibling]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(activations).toEqual(['empty']);
  });

  it('does not acquire a later iterable after a synchronous empty input completes', () => {
    let iteratorAcquisitions = 0;
    const laterIterable = {
      [Symbol.iterator]() {
        iteratorAcquisitions++;
        return [1][Symbol.iterator]();
      },
    };
    const events: string[] = [];

    zip([[], laterIterable]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(iteratorAcquisitions).toBe(0);
  });

  it('completes for an empty iterable and cancels an already active sibling', () => {
    const sibling = controllable<number>();
    const events: string[] = [];

    zip([sibling.observable, []]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(sibling.subscriber.active).toBe(false);
    expect(sibling.teardowns).toBe(1);
  });

  it('completes after the final tuple drains a completed source buffer', () => {
    const sibling = controllable<string>();
    const events: Array<readonly [number, string] | 'complete'> = [];
    const result = zip([Observable.from([1]), sibling.observable]);
    expectTypeOf(result).toEqualTypeOf<Observable<[number, string]>>();

    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });
    sibling.subscriber.next('a');

    expect(events).toEqual([[1, 'a'], 'complete']);
    expect(sibling.subscriber.active).toBe(false);
    expect(sibling.teardowns).toBe(1);
  });

  it('forwards an input error and cancels every sibling', () => {
    const left = controllable<number>();
    const right = controllable<string>();
    const failure = new Error('zip input failed');
    const errors: unknown[] = [];

    zip([left.observable, right.observable]).subscribe({
      error: (error) => errors.push(error),
    });
    left.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);
  });

  it('shares input activation and terminal buffer draining among concurrent observers', () => {
    const left = controllable<number>();
    const right = controllable<string>();
    const firstEvents: Array<readonly [number, string] | 'complete'> = [];
    const secondEvents: Array<readonly [number, string] | 'complete'> = [];
    const result = zip([left.observable, right.observable]);

    result.subscribe({
      next: (value) => firstEvents.push(value),
      complete: () => firstEvents.push('complete'),
    });
    result.subscribe({
      next: (value) => secondEvents.push(value),
      complete: () => secondEvents.push('complete'),
    });

    left.subscriber.next(1);
    left.subscriber.complete();
    right.subscriber.next('a');

    expect(firstEvents).toEqual([[1, 'a'], 'complete']);
    expect(secondEvents).toEqual([[1, 'a'], 'complete']);
    expect(left.subscriptions).toBe(1);
    expect(right.subscriptions).toBe(1);
    expect(right.subscriber.active).toBe(false);
  });

  it('cancels inputs only after the final result observer leaves', () => {
    const left = controllable<number>();
    const right = controllable<string>();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const result = zip([left.observable, right.observable]);

    result.subscribe(() => {}, { signal: firstController.signal });
    result.subscribe(() => {}, { signal: secondController.signal });

    expect(left.subscriptions).toBe(1);
    expect(right.subscriptions).toBe(1);

    firstController.abort();
    expect(left.subscriber.active).toBe(true);
    expect(right.subscriber.active).toBe(true);

    secondController.abort();
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);
  });

  it('fills a completed empty input until its sibling completes', () => {
    const events: Array<readonly [number, number] | 'complete'> = [];

    zip([[], [1, 2]], { fillAfterComplete: 0 }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([[0, 1], [0, 2], 'complete']);
  });

  it('drains unequal completed buffers with fill values and then completes', () => {
    const events: Array<readonly [number, string | null] | 'complete'> = [];

    zip([[1, 2], ['a']], { fillAfterComplete: null }).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([[1, 'a'], [2, null], 'complete']);
  });

  it('projects each tuple with the RxJS result-selector overload', () => {
    const events: Array<string | 'complete'> = [];

    zip([Observable.from([1, 2]), Observable.from(['a', 'b'])], (left, right) => `${left}:${right}`).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['1:a', '2:b', 'complete']);
  });

  it('forwards result-selector errors through the derived observable', () => {
    const expected = new Error('projection failed');
    const errors: unknown[] = [];

    zip([Observable.from([1]), Observable.from([2])], () => {
      throw expected;
    }).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([expected]);
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
