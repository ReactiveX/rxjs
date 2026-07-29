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

function controllable<T>(): { observable: Observable<T>; readonly subscriber: Subscriber<T> } {
  let sourceSubscriber: Subscriber<T> | undefined;
  const observable = new Observable<T>((subscriber) => {
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
  };
}
