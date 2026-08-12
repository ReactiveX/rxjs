import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { sequenceEqual } from './sequence-equal.js';

describe('sequenceEqual', () => {
  it('emits true when both sequences complete with equal values', () => {
    const results: Array<boolean | 'complete'> = [];
    const left = fromValues(1, 2);
    const right = fromValues(1, 2);

    const equal = left[sequenceEqual](right);
    expectTypeOf(equal).toEqualTypeOf<Observable<boolean>>();

    equal.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([true, 'complete']);
  });

  it('calls a provided comparator once for each paired value', () => {
    const calls: Array<[number, number]> = [];
    const results: boolean[] = [];
    const left = fromValues(1, 2);
    const right = fromValues(11, 12);

    left[sequenceEqual](right, (leftValue, rightValue) => {
      calls.push([leftValue, rightValue]);
      return leftValue + 10 === rightValue;
    }).subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [1, 11],
      [2, 12],
    ]);
    expect(results).toEqual([true]);
  });

  it('emits false and closes both inputs when the comparator returns false', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    const calls: Array<[number, number]> = [];
    const results: Array<boolean | 'complete'> = [];

    left.observable[sequenceEqual](right.observable, (leftValue, rightValue) => {
      calls.push([leftValue, rightValue]);
      return leftValue === rightValue;
    }).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    left.subscriber.next(1);
    right.subscriber.next(2);

    expect(calls).toEqual([[1, 2]]);
    expect(results).toEqual([false, 'complete']);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
  });

  it('forwards a comparator error and closes both inputs', () => {
    const failure = new Error('comparison failed');
    const left = controllable<number>();
    const right = controllable<number>();
    const errors: unknown[] = [];

    left.observable[sequenceEqual](right.observable, () => {
      throw failure;
    }).subscribe({
      error: (error) => errors.push(error),
    });
    left.subscriber.next(1);
    right.subscriber.next(1);

    expect(errors).toEqual([failure]);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
  });

  it('shares both inputs and comparator work among concurrent observers', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    const firstResults: boolean[] = [];
    const secondResults: boolean[] = [];
    let comparisons = 0;
    const equal = left.observable[sequenceEqual](right.observable, (leftValue, rightValue) => {
      comparisons++;
      return leftValue === rightValue;
    });

    equal.subscribe((value) => firstResults.push(value));
    equal.subscribe((value) => secondResults.push(value));
    left.subscriber.next(1);
    right.subscriber.next(1);
    left.subscriber.complete();
    right.subscriber.complete();

    expect(firstResults).toEqual([true]);
    expect(secondResults).toEqual([true]);
    expect(comparisons).toBe(1);
    expect(left.subscriptions).toBe(1);
    expect(right.subscriptions).toBe(1);
  });

  it('emits false and closes both inputs when one emits after the other completed empty', () => {
    const produced: number[] = [];
    const left = fromValues<number>();
    const right = new Observable<number>((subscriber) => {
      for (const value of [1, 2]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });
    const results: Array<boolean | 'complete'> = [];

    left[sequenceEqual](right).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([false, 'complete']);
    expect(produced).toEqual([1]);
  });

  it('emits false when the source produces an extra value after the comparison completes', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    const results: Array<boolean | 'complete'> = [];

    left.observable[sequenceEqual](right.observable).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    left.subscriber.next(1);
    right.subscriber.next(1);
    right.subscriber.complete();
    left.subscriber.next(2);

    expect(results).toEqual([false, 'complete']);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
  });

  it('emits false when the comparison produces an extra value after the source completes', () => {
    const left = controllable<number>();
    const right = controllable<number>();
    const results: Array<boolean | 'complete'> = [];

    left.observable[sequenceEqual](right.observable).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });
    left.subscriber.next(1);
    right.subscriber.next(1);
    left.subscriber.complete();
    right.subscriber.next(2);

    expect(results).toEqual([false, 'complete']);
    expect(left.subscriber.active).toBe(false);
    expect(right.subscriber.active).toBe(false);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}

function controllable<T>(): {
  observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  const observable = new Observable<T>((subscriber) => {
    subscriptions++;
    sourceSubscriber = subscriber;
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
  };
}
