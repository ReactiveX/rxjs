import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { EmptyError } from './empty-error.js';
import { NotFoundError } from './not-found-error.js';
import { SequenceError } from './sequence-error.js';
import { single } from './single.js';

describe('single', () => {
  it('emits one unfiltered value only when the source completes', () => {
    let activeSubscriber: Subscriber<number> | undefined;
    const observations: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      activeSubscriber = subscriber;
    });

    source[single]().subscribe({
      next: (value) => observations.push(value),
      complete: () => observations.push('complete'),
    });
    activeSubscriber?.next(42);

    expect(observations).toEqual([]);

    activeSubscriber?.complete();

    expect(observations).toEqual([42, 'complete']);
  });

  it('passes value, zero-based index, and source to the predicate and emits the one match on completion', () => {
    const source = fromValues(1, 2, 3);
    const calls: Array<[number, number, Observable<number>]> = [];
    const results: number[] = [];

    source[single]((value, index, predicateSource) => {
      calls.push([value, index, predicateSource]);
      return value === 2;
    }).subscribe((value) => results.push(value));

    expect(calls).toEqual([
      [1, 0, source],
      [2, 1, source],
      [3, 2, source],
    ]);
    expect(results).toEqual([2]);
  });

  it('uses EmptyError when an empty source completes with or without a predicate', () => {
    const withoutPredicate: unknown[] = [];
    const withPredicate: unknown[] = [];

    empty<number>()[single]().subscribe({
      error: (error) => withoutPredicate.push(error),
    });
    empty<number>()[single](() => false).subscribe({
      error: (error) => withPredicate.push(error),
    });

    expect(withoutPredicate).toHaveLength(1);
    expect(withPredicate).toHaveLength(1);
    expect(withoutPredicate[0]).toBeInstanceOf(EmptyError);
    expect(withPredicate[0]).toBeInstanceOf(EmptyError);
    expect((withoutPredicate[0] as Error).message).toBe('no elements in sequence');
    expect((withPredicate[0] as Error).message).toBe('no elements in sequence');
  });

  it('uses NotFoundError when values were seen but none matched', () => {
    const errors: unknown[] = [];

    fromValues(1, 2, 3)
      [single](() => false)
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(NotFoundError);
    expect((errors[0] as Error).name).toBe('NotFoundError');
    expect((errors[0] as Error).message).toBe('No matching values');
  });

  it('aborts synchronous source work before reporting SequenceError for multiple matches', () => {
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

    source[single]().subscribe({
      error: (error) => {
        sourceActiveWhenErrored = activeSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(SequenceError);
    expect((errors[0] as Error).name).toBe('SequenceError');
    expect((errors[0] as Error).message).toBe('Too many matching values');
  });

  it('counts only matching values when deciding whether the sequence contains too many', () => {
    const errors: unknown[] = [];

    fromValues(1, 2, 3, 4)
      [single]((value) => value % 2 === 0)
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(SequenceError);
    expect((errors[0] as Error).message).toBe('Too many matching values');
  });

  it('aborts source work before forwarding predicate errors', () => {
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

    source[single]((value) => {
      if (value === 2) {
        throw failure;
      }
      return false;
    }).subscribe({
      error: (error) => {
        sourceActiveWhenErrored = activeSubscriber?.active;
        errors.push(error);
      },
    });

    expect(produced).toEqual([1, 2]);
    expect(sourceActiveWhenErrored).toBe(false);
    expect(errors).toEqual([failure]);
  });

  it('forwards source errors unchanged without emitting a stored match', () => {
    const failure = new Error('source failed');
    const observations: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[single]().subscribe({
      next: (value) => observations.push(value),
      error: (error) => observations.push(error),
      complete: () => observations.push('complete'),
    });

    expect(observations).toEqual([failure]);
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
    const selected = source[single]((value, index) => {
      predicateCalls++;
      return value === index + 1;
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
    activeSubscriber?.next(0);

    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([]);
    expect(predicateCalls).toBe(2);
    expect(sourceTeardowns).toBe(0);

    secondController.abort();

    expect(activeSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    selected.subscribe((value) => restartedResults.push(value));
    activeSubscriber?.next(1);
    activeSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(predicateCalls).toBe(3);
    expect(restartedResults).toEqual([1]);
    expect(sourceTeardowns).toBe(2);
  });

  it('preserves Boolean narrowing and installs only an exact unique Symbol method', () => {
    const source = new Observable<0 | 1 | '' | 'value' | null | undefined>(() => {});
    const truthy = source[single](Boolean);
    type HasStringNamedSingle = 'single' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(truthy).toEqualTypeOf<Observable<1 | 'value'>>();
    expectTypeOf<HasStringNamedSingle>().toEqualTypeOf<false>();
    expect(single.description).toBe('single');
    expect(Symbol.keyFor(single)).toBeUndefined();
    expect('single' in Observable.prototype).toBe(false);
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
