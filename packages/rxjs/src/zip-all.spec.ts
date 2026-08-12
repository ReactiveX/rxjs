import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { zipAll } from './zip-all.js';

describe('zipAll', () => {
  it('collects inner sources until the outer completes before activating them', () => {
    const activations: string[] = [];
    const first = new Observable<number>((subscriber) => {
      activations.push('first');
      subscriber.next(1);
      subscriber.complete();
    });
    const second = new Observable<number>((subscriber) => {
      activations.push('second');
      subscriber.next(2);
      subscriber.complete();
    });
    let outerSubscriber: Subscriber<Observable<number>> | undefined;
    const outer = new Observable<Observable<number>>((subscriber) => {
      outerSubscriber = subscriber;
    });
    const observations: Array<number[] | 'complete'> = [];

    outer[zipAll]().subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    outerSubscriber?.next(first);
    outerSubscriber?.next(second);

    expect(activations).toEqual([]);
    expect(observations).toEqual([]);

    outerSubscriber?.complete();

    expect(activations).toEqual(['first', 'second']);
    expect(observations).toEqual([[1, 2], 'complete']);
  });

  it('completes without activating an inner source when the outer is empty', () => {
    let innerActivations = 0;
    const unused = new Observable<number>(() => {
      innerActivations++;
    });
    const observations: string[] = [];
    const outer = new Observable<Observable<number>>((subscriber) => subscriber.complete());

    outer[zipAll]().subscribe({
      next: () => observations.push('next'),
      complete: () => observations.push('complete'),
    });

    expect(innerActivations).toBe(0);
    expect(unused).toBeInstanceOf(Observable);
    expect(observations).toEqual(['complete']);
  });

  it('supports an optional result selector', () => {
    const results: Array<string | 'complete'> = [];

    fromValues<ObservableValue<string | number>>(Observable.from(['a', 'b']), Observable.from([1, 2]))
      [zipAll]((letter, number) => `${letter}${number}`)
      .subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('complete'),
      });

    expect(results).toEqual(['a1', 'b2', 'complete']);
  });

  it('forwards outer errors without activating collected inner sources', () => {
    const failure = new Error('outer failed');
    let innerActivations = 0;
    const inner = new Observable<number>(() => {
      innerActivations++;
    });
    const observations: unknown[] = [];
    const outer = new Observable<Observable<number>>((subscriber) => {
      subscriber.next(inner);
      subscriber.error(failure);
    });

    outer[zipAll]().subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(innerActivations).toBe(0);
    expect(observations).toEqual([failure]);
  });

  it('forwards inner errors and cancels sibling sources', () => {
    const failure = new Error('inner failed');
    const left = controllable<number>();
    const right = controllable<string>();
    const errors: unknown[] = [];

    fromValues<ObservableValue<number | string>>(left.observable, right.observable)
      [zipAll]()
      .subscribe({
        error: (error) => errors.push(error),
      });
    left.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);
  });

  it('forwards selector errors and cancels all inner sources', () => {
    const failure = new Error('selector failed');
    const left = controllable<number>();
    const right = controllable<number>();
    const errors: unknown[] = [];

    fromValues<ObservableValue<number>>(left.observable, right.observable)
      [zipAll](() => {
        throw failure;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });
    left.subscriber.next(1);
    right.subscriber.next(2);

    expect(errors).toEqual([failure]);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);
  });

  it('completes at the shortest inner and cancels active and later siblings synchronously', () => {
    const active = controllable<number>();
    let laterActivations = 0;
    const later = new Observable<number>(() => {
      laterActivations++;
    });
    const observations: string[] = [];

    fromValues<ObservableValue<number>>(active.observable, [], later)
      [zipAll]()
      .subscribe({
        next: () => observations.push('next'),
        complete: () => observations.push('complete'),
      });

    expect(observations).toEqual(['complete']);
    expect(active.subscriber.active).toBe(false);
    expect(active.teardowns).toBe(1);
    expect(laterActivations).toBe(0);
  });

  it('handles a reentrant sibling notification while draining the final tuple', () => {
    const left = controllable<number>();
    const observations: Array<number[] | 'complete'> = [];

    fromValues<ObservableValue<number>>(left.observable, [10])
      [zipAll]()
      .subscribe({
        next: (value) => {
          observations.push(value);
          left.subscriber.next(2);
        },
        complete: () => observations.push('complete'),
      });
    left.subscriber.next(1);

    expect(observations).toEqual([[1, 10], 'complete']);
    expect(left.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
  });

  it('shares collection and inner work, ref-counts cancellation, and restarts cleanly', () => {
    const left = controllable<number>();
    const right = controllable<string>();
    let outerActivations = 0;
    let outerSubscriber: Subscriber<ObservableValue<number | string>> | undefined;
    const outer = new Observable<ObservableValue<number | string>>((subscriber) => {
      outerActivations++;
      outerSubscriber = subscriber;
    });
    const zipped = outer[zipAll]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: Array<Array<number | string>> = [];
    const secondResults: Array<Array<number | string>> = [];

    zipped.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    zipped.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    outerSubscriber?.next(left.observable);
    outerSubscriber?.next(right.observable);
    outerSubscriber?.complete();
    left.subscriber.next(1);
    right.subscriber.next('a');

    expect(outerActivations).toBe(1);
    expect(left.subscriptions).toBe(1);
    expect(right.subscriptions).toBe(1);
    expect(firstResults).toEqual([[1, 'a']]);
    expect(secondResults).toEqual([[1, 'a']]);

    firstController.abort();
    left.subscriber.next(2);
    right.subscriber.next('b');

    expect(firstResults).toEqual([[1, 'a']]);
    expect(secondResults).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
    expect(left.subscriber.active).toBe(true);
    expect(right.subscriber.active).toBe(true);

    secondController.abort();

    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);

    const restartedResults: Array<Array<number | string>> = [];
    zipped.subscribe((value) => restartedResults.push(value));
    outerSubscriber?.next(left.observable);
    outerSubscriber?.next(right.observable);
    outerSubscriber?.complete();
    left.subscriber.next(3);
    right.subscriber.next('c');

    expect(outerActivations).toBe(2);
    expect(left.subscriptions).toBe(2);
    expect(right.subscriptions).toBe(2);
    expect(restartedResults).toEqual([[3, 'c']]);
  });

  it('preserves result types and installs only an exact unique Symbol method', () => {
    const homogeneous = new Observable<Observable<number>>(() => {})[zipAll]();
    const projected = new Observable<Observable<number>>(() => {})[zipAll]((value) => String(value));
    type HasStringNamedZipAll = 'zipAll' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(homogeneous).toEqualTypeOf<Observable<number[]>>();
    expectTypeOf(projected).toEqualTypeOf<Observable<string>>();
    expectTypeOf<HasStringNamedZipAll>().toEqualTypeOf<false>();
    expect(zipAll.description).toBe('zipAll');
    expect(Symbol.keyFor(zipAll)).toBeUndefined();
    expect('zipAll' in Observable.prototype).toBe(false);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        break;
      }
      subscriber.next(value);
    }
    subscriber.complete();
  });
}

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
