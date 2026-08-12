import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import './create.js';

type ForkJoinSymbol = typeof import('./fork-join.js').forkJoin;

let forkJoin: ForkJoinSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'forkJoin' in Observable;
  ({ forkJoin } = await import('./fork-join.js'));
});

describe('forkJoin', () => {
  it('installs only an exact static Symbol-keyed factory', () => {
    expect(hadStringMethod).toBe(false);
    expect('forkJoin' in Observable).toBe(false);
    expect('forkJoin' in Observable.prototype).toBe(false);
    expect(forkJoin.description).toBe('forkJoin');
    expect(Symbol.keyFor(forkJoin)).toBeUndefined();
    expect(forkJoin in Observable.prototype).toBe(false);
  });

  it('emits the last values from an array with exact tuple typing', () => {
    const result = Observable[forkJoin]([
      Observable.from([1, 2]),
      Observable.from(['a', 'b']),
      [true, false],
    ] as const);
    const events: Array<readonly [number, string, boolean] | 'complete'> = [];

    expectTypeOf(result).toEqualTypeOf<Observable<[number, string, boolean]>>();
    result.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([[2, 'b', false], 'complete']);
  });

  it('preserves object keys and exact property value types', () => {
    const result = Observable[forkJoin]({
      count: Observable.from([1, 2]),
      label: ['done'],
      enabled: [false, true],
    });
    const values: Array<{ count: number; label: string; enabled: boolean }> = [];

    expectTypeOf(result).toEqualTypeOf<Observable<{ count: number; label: string; enabled: boolean }>>();
    return new Promise<void>((resolve) => {
      result.subscribe({
        next: (value) => values.push(value),
        complete: resolve,
      });
    }).then(() => {
      expect(values).toEqual([{ count: 2, label: 'done', enabled: true }]);
    });
  });

  it('accepts Promise inputs with their resolved value type', () => {
    const result = Observable[forkJoin]([Promise.resolve(1), Observable.from(['done'])] as const);

    expectTypeOf(result).toEqualTypeOf<Observable<[number, string]>>();
  });

  it('returns an unknown value type when the input itself is any', () => {
    const input: any = [Observable.from([1])];
    const result = Observable[forkJoin](input);

    expectTypeOf(result).toEqualTypeOf<Observable<unknown>>();
  });

  it('supports deprecated rest inputs and array or rest result selectors', () => {
    const restEvents: Array<string | 'complete'> = [];
    const arrayEvents: Array<number | 'complete'> = [];
    const restResult = Observable[forkJoin](
      Observable.from([1, 2]),
      Observable.from(['a', 'b']),
      (count, label) => `${label}:${count}`
    );
    const arrayResult = Observable[forkJoin]([Observable.from([1, 2]), Observable.from([3, 4])] as const, (left, right) => left + right);

    expectTypeOf(restResult).toEqualTypeOf<Observable<string>>();
    expectTypeOf(arrayResult).toEqualTypeOf<Observable<number>>();
    restResult.subscribe({
      next: (value) => restEvents.push(value),
      complete: () => restEvents.push('complete'),
    });
    arrayResult.subscribe({
      next: (value) => arrayEvents.push(value),
      complete: () => arrayEvents.push('complete'),
    });

    expect(restEvents).toEqual(['b:2', 'complete']);
    expect(arrayEvents).toEqual([6, 'complete']);
  });

  it('completes without a value for no inputs, an empty array, or an empty object', () => {
    const noInputs = Observable[forkJoin]();
    const emptyArray = Observable[forkJoin]([] as const);
    const emptyObject = Observable[forkJoin]({});
    const events: string[] = [];

    expectTypeOf(noInputs).toEqualTypeOf<Observable<never>>();
    expectTypeOf(emptyArray).toEqualTypeOf<Observable<never>>();
    expectTypeOf(emptyObject).toEqualTypeOf<Observable<never>>();

    for (const result of [noInputs, emptyArray, emptyObject]) {
      result.subscribe({
        next: () => events.push('next'),
        complete: () => events.push('complete'),
      });
    }

    expect(events).toEqual(['complete', 'complete', 'complete']);
  });

  it('completes early for an empty member, cancels siblings, and does not activate later inputs', () => {
    const active = controllable<number>();
    let laterIteratorAcquisitions = 0;
    const later = {
      [Symbol.iterator]() {
        laterIteratorAcquisitions++;
        return [42][Symbol.iterator]();
      },
    };
    const events: string[] = [];

    Observable[forkJoin]([active.observable, [], later]).subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(active.subscriber.active).toBe(false);
    expect(active.teardowns).toBe(1);
    expect(laterIteratorAcquisitions).toBe(0);
  });

  it('forwards an input error, cancels siblings, and stops synchronous activation', () => {
    const active = controllable<number>();
    const failure = new Error('input failed');
    let laterActivations = 0;
    const failing = new Observable<never>((subscriber) => subscriber.error(failure));
    const later = new Observable<number>(() => {
      laterActivations++;
    });
    const errors: unknown[] = [];

    Observable[forkJoin](active.observable, failing, later).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
    expect(active.subscriber.active).toBe(false);
    expect(active.teardowns).toBe(1);
    expect(laterActivations).toBe(0);
  });

  it('delivers input conversion and result selector errors through the stream', () => {
    const conversionErrors: unknown[] = [];
    const selectorFailure = new Error('selector failed');
    const selectorErrors: unknown[] = [];
    let laterIteratorAcquisitions = 0;
    const later = {
      [Symbol.iterator]() {
        laterIteratorAcquisitions++;
        return [1][Symbol.iterator]();
      },
    };

    Observable[forkJoin](null as any, later).subscribe({
      error: (error) => conversionErrors.push(error),
    });
    Observable[forkJoin]([Observable.from([1])], () => {
      throw selectorFailure;
    }).subscribe({
      error: (error) => selectorErrors.push(error),
    });

    expect(conversionErrors).toHaveLength(1);
    expect(conversionErrors[0]).toBeInstanceOf(TypeError);
    expect(laterIteratorAcquisitions).toBe(0);
    expect(selectorErrors).toEqual([selectorFailure]);
  });

  it('shares input work, ref-counts cancellation, and restarts with fresh last-value state', () => {
    const leftSubscribers: Subscriber<number>[] = [];
    const rightSubscribers: Subscriber<string>[] = [];
    let leftTeardowns = 0;
    let rightTeardowns = 0;
    const left = new Observable<number>((subscriber) => {
      leftSubscribers.push(subscriber);
      subscriber.addTeardown(() => leftTeardowns++);
    });
    const right = new Observable<string>((subscriber) => {
      rightSubscribers.push(subscriber);
      subscriber.addTeardown(() => rightTeardowns++);
    });
    const result = Observable[forkJoin]([left, right] as const);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstValues: Array<readonly [number, string]> = [];
    const secondValues: Array<readonly [number, string]> = [];

    result.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    result.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(leftSubscribers).toHaveLength(1);
    expect(rightSubscribers).toHaveLength(1);
    leftSubscribers[0]?.next(1);
    rightSubscribers[0]?.next('a');

    firstController.abort();
    expect(leftSubscribers[0]?.active).toBe(true);
    expect(rightSubscribers[0]?.active).toBe(true);

    secondController.abort();
    expect(leftSubscribers[0]?.active).toBe(false);
    expect(rightSubscribers[0]?.active).toBe(false);
    expect(leftTeardowns).toBe(1);
    expect(rightTeardowns).toBe(1);

    const restartedValues: Array<readonly [number, string]> = [];
    result.subscribe((value) => restartedValues.push(value));
    expect(leftSubscribers).toHaveLength(2);
    expect(rightSubscribers).toHaveLength(2);
    leftSubscribers[1]?.next(2);
    leftSubscribers[1]?.complete();
    rightSubscribers[1]?.next('b');
    rightSubscribers[1]?.complete();

    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([]);
    expect(restartedValues).toEqual([[2, 'b']]);
    expect(leftTeardowns).toBe(2);
    expect(rightTeardowns).toBe(2);
  });

  it('constructs results through the static receiver', () => {
    class DerivedObservable<T> extends Observable<T> {}

    const DerivedCtor = DerivedObservable as unknown as ObservableCtor;
    const result = DerivedCtor[forkJoin]([Observable.from([1])]);

    expect(result).toBeInstanceOf(DerivedObservable);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
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
    get teardowns() {
      return teardowns;
    },
  };
}
