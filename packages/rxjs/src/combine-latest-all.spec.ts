import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { combineLatestAll } from './combine-latest-all.js';

describe('combineLatestAll', () => {
  it('collects inner sources until the outer completes before activating them', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    let outerSubscriber: Subscriber<Observable<number>> | undefined;
    const outer = new Observable<Observable<number>>((subscriber) => {
      outerSubscriber = subscriber;
    });
    const observations: Array<number[] | 'complete'> = [];

    outer[combineLatestAll]().subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    outerSubscriber?.next(left.observable);
    outerSubscriber?.next(right.observable);

    expect(left.subscriptions).toBe(0);
    expect(right.subscriptions).toBe(0);
    expect(observations).toEqual([]);

    outerSubscriber?.complete();
    left.subscriber.next(1);
    right.subscriber.next(10);
    left.subscriber.next(2);
    right.subscriber.next(20);
    left.subscriber.complete();
    right.subscriber.complete();

    expect(left.subscriptions).toBe(1);
    expect(right.subscriptions).toBe(1);
    expect(observations).toEqual([
      [1, 10],
      [2, 10],
      [2, 20],
      'complete',
    ]);
  });

  it('completes immediately when the outer source is empty', () => {
    const observations: string[] = [];
    const outer = new Observable<Observable<number>>((subscriber) => subscriber.complete());

    outer[combineLatestAll]().subscribe({
      next: () => observations.push('next'),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual(['complete']);
  });

  it('supports an optional result selector', () => {
    const results: Array<string | 'complete'> = [];

    fromValues<ObservableValue<string | number>>(Observable.from(['a']), Observable.from([1]))
      [combineLatestAll]((letter, number) => `${letter}${number}`)
      .subscribe({
        next: (value) => results.push(value),
        complete: () => results.push('complete'),
      });

    expect(results).toEqual(['a1', 'complete']);
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

    outer[combineLatestAll]().subscribe({
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
    const right = controllable<number>();
    const errors: unknown[] = [];

    fromValues<ObservableValue<number>>(left.observable, right.observable)
      [combineLatestAll]()
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
      [combineLatestAll](() => {
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

  it('does not complete when one inner is empty while another remains active', () => {
    const never = controllable<number>();
    const controller = new AbortController();
    const observations: string[] = [];

    fromValues<ObservableValue<number>>(never.observable, [])
      [combineLatestAll]()
      .subscribe({
        next: () => observations.push('next'),
        complete: () => observations.push('complete'),
      }, { signal: controller.signal });

    expect(observations).toEqual([]);
    expect(never.subscriber.active).toBe(true);

    controller.abort();

    expect(never.subscriber.active).toBe(false);
    expect(never.teardowns).toBe(1);
  });

  it('preserves synchronous reentrant inner notifications', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    const observations: number[][] = [];

    fromValues<ObservableValue<number>>(left.observable, right.observable)
      [combineLatestAll]()
      .subscribe((value) => {
        observations.push(value);
        if (value[0] === 1) {
          left.subscriber.next(2);
        }
      });
    left.subscriber.next(1);
    right.subscriber.next(10);

    expect(observations).toEqual([
      [1, 10],
      [2, 10],
    ]);
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
    const combined = outer[combineLatestAll]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: Array<Array<number | string>> = [];
    const secondResults: Array<Array<number | string>> = [];

    combined.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    combined.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
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

    expect(firstResults).toEqual([[1, 'a']]);
    expect(secondResults).toEqual([
      [1, 'a'],
      [2, 'a'],
    ]);
    expect(left.subscriber.active).toBe(true);
    expect(right.subscriber.active).toBe(true);

    secondController.abort();

    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
    expect(left.teardowns).toBe(1);
    expect(right.teardowns).toBe(1);

    const restartedResults: Array<Array<number | string>> = [];
    combined.subscribe((value) => restartedResults.push(value));
    outerSubscriber?.next(left.observable);
    outerSubscriber?.next(right.observable);
    outerSubscriber?.complete();
    left.subscriber.next(3);
    right.subscriber.next('b');

    expect(outerActivations).toBe(2);
    expect(left.subscriptions).toBe(2);
    expect(right.subscriptions).toBe(2);
    expect(restartedResults).toEqual([[3, 'b']]);
  });

  it('preserves result types and installs only an exact unique Symbol method', () => {
    const homogeneous = new Observable<Observable<number>>(() => {})[combineLatestAll]();
    const projected = new Observable<Observable<number>>(() => {})[combineLatestAll]((value) => String(value));
    type HasStringNamedCombineLatestAll = 'combineLatestAll' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(homogeneous).toEqualTypeOf<Observable<number[]>>();
    expectTypeOf(projected).toEqualTypeOf<Observable<string>>();
    expectTypeOf<HasStringNamedCombineLatestAll>().toEqualTypeOf<false>();
    expect(combineLatestAll.description).toBe('combineLatestAll');
    expect(Symbol.keyFor(combineLatestAll)).toBeUndefined();
    expect('combineLatestAll' in Observable.prototype).toBe(false);
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
