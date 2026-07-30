import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { EmptyError } from './empty-error.js';

type FirstSymbol = typeof import('./first.js').first;

let first: FirstSymbol;
let platformFirst: Observable<unknown>['first'];
let platformFirstDescriptor: PropertyDescriptor | undefined;

beforeAll(async () => {
  platformFirst = Observable.prototype.first;
  platformFirstDescriptor = Object.getOwnPropertyDescriptor(Observable.prototype, 'first');
  ({ first } = await import('./first.js'));
});

describe('first', () => {
  it('emits the first value and aborts synchronous source work before delivery', () => {
    const produced: number[] = [];
    const observations: Array<number | 'complete'> = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActiveDuringDelivery: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[first]().subscribe({
      next: (value) => {
        sourceActiveDuringDelivery = sourceSubscriber?.active;
        sourceSubscriber?.next(99);
        observations.push(value);
      },
      complete: () => observations.push('complete'),
    });

    expect(produced).toEqual([1]);
    expect(sourceActiveDuringDelivery).toBe(false);
    expect(observations).toEqual([1, 'complete']);
  });

  it('emits the first matching value and supplies value, index, and source to the predicate', () => {
    const source = fromValues(1, 2, 3, 4);
    const calls: Array<[number, number, Observable<number>]> = [];
    const observations: Array<number | 'complete'> = [];

    source[first]((value, index, predicateSource) => {
      calls.push([value, index, predicateSource]);
      return value === 3;
    }).subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });

    expect(calls).toEqual([
      [1, 0, source],
      [2, 1, source],
      [3, 2, source],
    ]);
    expect(observations).toEqual([3, 'complete']);
  });

  it('emits a supplied default when no value matches, including explicit undefined', () => {
    const emptyDefault: Array<number | string | 'complete'> = [];
    const noMatchDefault: Array<number | string | 'complete'> = [];
    const undefinedDefault: Array<string | undefined | 'complete'> = [];

    empty<number>()[first](null, 'empty').subscribe({
      next: (value) => emptyDefault.push(value),
      complete: () => emptyDefault.push('complete'),
    });
    fromValues(1, 2)[first]((value) => value > 10, 'missing').subscribe({
      next: (value) => noMatchDefault.push(value),
      complete: () => noMatchDefault.push('complete'),
    });
    fromValues<string>('a', 'b')[first]((value) => value === 'c', undefined).subscribe({
      next: (value) => undefinedDefault.push(value),
      complete: () => undefinedDefault.push('complete'),
    });

    expect(emptyDefault).toEqual(['empty', 'complete']);
    expect(noMatchDefault).toEqual(['missing', 'complete']);
    expect(undefinedDefault).toEqual([undefined, 'complete']);
  });

  it('errors with EmptyError when an empty source or no value matches without a default', () => {
    const emptyErrors: unknown[] = [];
    const noMatchErrors: unknown[] = [];

    empty<number>()[first]().subscribe({ error: (error) => emptyErrors.push(error) });
    fromValues(1, 2)[first]((value) => value > 10).subscribe({ error: (error) => noMatchErrors.push(error) });

    expect(emptyErrors).toHaveLength(1);
    expect(emptyErrors[0]).toBeInstanceOf(EmptyError);
    expect(noMatchErrors).toHaveLength(1);
    expect(noMatchErrors[0]).toBeInstanceOf(EmptyError);
  });

  it('forwards source errors instead of a default or EmptyError', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[first]((value) => value > 10, 42).subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
  });

  it('aborts synchronous source work before forwarding predicate errors', () => {
    const failure = new Error('predicate failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActiveWhenErrored: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[first]((value) => {
      if (value === 2) {
        throw failure;
      }
      return false;
    }).subscribe({
      error: (error) => {
        sourceActiveWhenErrored = sourceSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('propagates result cancellation and stops predicate work before a later match', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceTeardowns = 0;
    const predicateCalls: number[] = [];
    const values: number[] = [];
    const controller = new AbortController();
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });

    source[first]((value) => {
      predicateCalls.push(value);
      return value === 3;
    }).subscribe((value) => values.push(value), { signal: controller.signal });

    sourceSubscriber?.next(1);
    controller.abort();
    sourceSubscriber?.next(3);

    expect(sourceSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);
    expect(predicateCalls).toEqual([1]);
    expect(values).toEqual([]);
  });

  it('shares predicate and source work, ref-counts cancellation, and restarts after a match', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let predicateCalls = 0;
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const selected = source[first]((value, index) => {
      predicateCalls++;
      return value === index + 2;
    });
    const firstController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];

    selected.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    selected.subscribe((value) => secondValues.push(value));

    expect(sourceActivations).toBe(1);
    sourceSubscriber?.next(1);
    firstController.abort();
    sourceSubscriber?.next(3);

    expect(firstValues).toEqual([]);
    expect(secondValues).toEqual([3]);
    expect(predicateCalls).toBe(2);
    expect(sourceTeardowns).toBe(1);

    const restartedValues: number[] = [];
    selected.subscribe((value) => restartedValues.push(value));
    expect(sourceActivations).toBe(2);
    sourceSubscriber?.next(2);

    expect(restartedValues).toEqual([2]);
    expect(predicateCalls).toBe(3);
    expect(sourceTeardowns).toBe(2);
  });

  it('preserves RxJS 7 type-guard, Boolean, null/undefined predicate, and default types', () => {
    const mixed = new Observable<number | string>(() => {});
    const nullable = new Observable<0 | 1 | '' | 'value' | null | undefined>(() => {});
    const isString = (value: number | string): value is string => typeof value === 'string';

    const unchanged = mixed[first]();
    const nullPredicate = mixed[first](null);
    const undefinedPredicate = mixed[first](undefined);
    const guarded = mixed[first](isString);
    const guardedWithDefault = mixed[first](isString, false);
    const truthy = nullable[first](Boolean);
    const truthyWithDefault = nullable[first](Boolean, 'fallback' as const);
    const undefinedDefault = mixed[first](undefined, undefined);

    expectTypeOf(unchanged).toEqualTypeOf<Observable<number | string>>();
    expectTypeOf(nullPredicate).toEqualTypeOf<Observable<number | string>>();
    expectTypeOf(undefinedPredicate).toEqualTypeOf<Observable<number | string>>();
    expectTypeOf(guarded).toEqualTypeOf<Observable<string>>();
    expectTypeOf(guardedWithDefault).toEqualTypeOf<Observable<string | boolean>>();
    expectTypeOf(truthy).toEqualTypeOf<Observable<1 | 'value'>>();
    expectTypeOf(truthyWithDefault).toEqualTypeOf<Observable<1 | 'value' | 'fallback'>>();
    expectTypeOf(undefinedDefault).toEqualTypeOf<Observable<number | string | undefined>>();
  });

  it('installs only its exact unique Symbol and preserves the platform first method', () => {
    const unrelated = Symbol('first');
    const source = new Observable<number>(() => {});
    type HasRxjsFirstString = 'rxjsFirst' extends keyof Observable<unknown> ? true : false;

    expectTypeOf<HasRxjsFirstString>().toEqualTypeOf<false>();
    expect(first.description).toBe('first');
    expect(Symbol.keyFor(first)).toBeUndefined();
    expect(source[first]).toBeTypeOf('function');
    expect((source as unknown as Record<symbol, unknown>)[unrelated]).toBeUndefined();
    expect(source[first]).not.toBe(platformFirst);
    expect(Observable.prototype.first).toBe(platformFirst);
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, 'first')).toEqual(platformFirstDescriptor);
    expect('rxjsFirst' in source).toBe(false);
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

function empty<T>(): Observable<T> {
  return new Observable<T>((subscriber) => subscriber.complete());
}
