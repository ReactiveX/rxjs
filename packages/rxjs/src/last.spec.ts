import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { EmptyError } from './empty-error.js';

type LastSymbol = typeof import('./last.js').last;

let last: LastSymbol;
let platformLast: Observable<unknown>['last'];
let platformLastDescriptor: PropertyDescriptor | undefined;

beforeAll(async () => {
  platformLast = Observable.prototype.last;
  platformLastDescriptor = Object.getOwnPropertyDescriptor(Observable.prototype, 'last');
  ({ last } = await import('./last.js'));
});

describe('last', () => {
  it('emits only the last source value when the source completes', () => {
    let activeSubscriber: Subscriber<number> | undefined;
    const observations: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
    });

    source[last]().subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    activeSubscriber?.next(1);
    activeSubscriber?.next(2);

    expect(observations).toEqual([]);

    activeSubscriber?.complete();

    expect(observations).toEqual([2, 'complete']);
  });

  it('passes value, zero-based index, and source to the predicate and emits the last match', () => {
    const source = fromValues(1, 2, 3, 4);
    const calls: Array<[number, number, Observable<number>]> = [];
    const results: number[] = [];

    source
      [last]((value, index, predicateSource) => {
        calls.push([value, index, predicateSource]);
        return value % 2 === 0;
      })
      .subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [1, 0, source],
      [2, 1, source],
      [3, 2, source],
      [4, 3, source],
    ]);
    expect(results).toEqual([4]);
  });

  it('errors with EmptyError when an empty source or no matching value completes', () => {
    const emptyErrors: unknown[] = [];
    const unmatchedErrors: unknown[] = [];

    fromValues<number>()[last]().subscribe({
      error: (error) => emptyErrors.push(error),
    });
    fromValues(1, 2, 3)
      [last](() => false)
      .subscribe({
        error: (error) => unmatchedErrors.push(error),
      });

    expect(emptyErrors).toHaveLength(1);
    expect(unmatchedErrors).toHaveLength(1);
    expect(emptyErrors[0]).toBeInstanceOf(EmptyError);
    expect(unmatchedErrors[0]).toBeInstanceOf(EmptyError);
    expect((emptyErrors[0] as Error).message).toBe('no elements in sequence');
    expect((unmatchedErrors[0] as Error).message).toBe('no elements in sequence');
  });

  it('uses a supplied default only when no value matches, including an explicit undefined default', () => {
    const emptyDefault: Array<number | string> = [];
    const unmatchedDefault: Array<number | undefined> = [];
    const matchedValue: Array<number | string> = [];

    fromValues<number>()[last](null, 'empty').subscribe((value) => emptyDefault.push(value));
    fromValues(1, 2, 3)
      [last]((value) => value > 10, undefined)
      .subscribe((value) => unmatchedDefault.push(value));
    fromValues(1, 2, 3)
      [last]((value) => value > 1, 'unused')
      .subscribe((value) => matchedValue.push(value));

    expect(emptyDefault).toEqual(['empty']);
    expect(unmatchedDefault).toEqual([undefined]);
    expect(matchedValue).toEqual([3]);
  });

  it('forwards source errors unchanged without emitting a stored value or default', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[last](null, 42).subscribe({
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
    let activeSubscriber: Subscriber<number> | undefined;
    let sourceActiveWhenErrored: boolean | undefined;
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source
      [last]((value) => {
        if (value === 2) {
          throw failure;
        }
        return true;
      })
      .subscribe({
        error: (error) => {
          sourceActiveWhenErrored = activeSubscriber?.active;
          errors.push(error);
        },
      });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('stays silent and cancels the source when the result subscription is aborted', () => {
    let activeSubscriber: Subscriber<number> | undefined;
    let sourceTeardowns = 0;
    const observations: unknown[] = [];
    const controller = new AbortController();
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });

    source[last]().subscribe(
      {
        next: (value) => observations.push(value),
        error: (error) => observations.push(error),
        complete: () => observations.push('complete'),
      },
      { signal: controller.signal }
    );
    activeSubscriber?.next(1);
    controller.abort();
    activeSubscriber?.complete();

    expect(observations).toEqual([]);
    expect(activeSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);
  });

  it('shares predicate and source work, ref-counts cancellation, and restarts cleanly', () => {
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let predicateCalls = 0;
    let activeSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      activeSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const selected = source[last]((value) => {
      predicateCalls++;
      return value % 2 === 1;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    selected.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    selected.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    activeSubscriber?.next(1);

    expect(sourceActivations).toBe(1);
    expect(predicateCalls).toBe(1);

    firstController.abort();
    activeSubscriber?.next(3);
    activeSubscriber?.complete();

    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([3]);
    expect(predicateCalls).toBe(2);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    selected.subscribe((value) => restartedResults.push(value));
    activeSubscriber?.next(5);
    activeSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(predicateCalls).toBe(3);
    expect(restartedResults).toEqual([5]);
    expect(sourceTeardowns).toBe(2);
  });

  it('preserves type guards, Boolean narrowing, default unions, and null predicates', () => {
    const mixed = new Observable<number | string>(() => {});
    const nullable = new Observable<0 | 1 | '' | 'value' | null | undefined>(() => {});
    const strings = mixed[last]((value): value is string => typeof value === 'string');
    const stringsWithDefault = mixed[last]((value): value is string => typeof value === 'string', 'none');
    const truthy = nullable[last](Boolean);
    const truthyWithDefault = nullable[last](Boolean, 'default' as const);
    const nullableDefault = mixed[last](null, false);
    const explicitUndefinedDefault = mixed[last](undefined, undefined);

    expectTypeOf(strings).toEqualTypeOf<Observable<string>>();
    expectTypeOf(stringsWithDefault).toEqualTypeOf<Observable<string>>();
    expectTypeOf(truthy).toEqualTypeOf<Observable<1 | 'value'>>();
    expectTypeOf(truthyWithDefault).toEqualTypeOf<Observable<1 | 'value' | 'default'>>();
    expectTypeOf(nullableDefault).toEqualTypeOf<Observable<number | string | boolean>>();
    expectTypeOf(explicitUndefinedDefault).toEqualTypeOf<Observable<number | string | undefined>>();
  });

  it('installs only the exact unique Symbol-keyed method and preserves the platform string method', () => {
    const unrelatedLast = Symbol('last');
    const source = new Observable<number>(() => {});

    expect(last.description).toBe('last');
    expect(Symbol.keyFor(last)).toBeUndefined();
    expect(Observable.prototype.last).toBe(platformLast);
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, 'last')).toEqual(platformLastDescriptor);
    expect(source[last]).not.toBe(platformLast);
    expect(source[unrelatedLast as unknown as typeof last]).toBeUndefined();
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
