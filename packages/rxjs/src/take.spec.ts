import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { take } from './take.js';

describe('take', () => {
  it('emits only the requested number of values and cancels synchronous source work', () => {
    const produced: number[] = [];
    const results: Array<number | 'complete'> = [];
    const sourceActiveDuringDelivery: boolean[] = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
      for (const value of [1, 2, 3, 4]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    const taken = source[take](2);
    expectTypeOf(taken).toEqualTypeOf<Observable<number>>();
    taken.subscribe({
      next: (value) => {
        results.push(value);
        sourceActiveDuringDelivery.push(sourceSubscriber?.active ?? false);
      },
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
    expect(produced).toEqual([1, 2]);
    expect(sourceActiveDuringDelivery).toEqual([true, false]);
  });

  it.each([0, -42])('completes without activating the source for a count of %i', (count) => {
    let sourceActivations = 0;
    const results: string[] = [];
    const source = new Observable<number>(() => {
      sourceActivations++;
    });

    source[take](count).subscribe({
      complete: () => results.push('complete'),
    });

    expect(sourceActivations).toBe(0);
    expect(results).toEqual(['complete']);
  });

  it('forwards source completion before reaching the requested count', () => {
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.complete();
    });

    source[take](42).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
  });

  it('forwards source errors before reaching the requested count', () => {
    const failure = new Error('source failed');
    const results: number[] = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[take](42).subscribe({
      next: (value) => results.push(value),
      error: (error) => errors.push(error),
    });

    expect(results).toEqual([1]);
    expect(errors).toEqual([failure]);
  });

  it('completes safely when downstream work reenters the source', () => {
    let sourceSubscriber: Subscriber<void> | undefined;
    let emissions = 0;
    let completed = false;
    const source = new Observable<void>((subscriber) => {
      sourceSubscriber = subscriber;
    });

    source[take](5).subscribe({
      next: () => {
        emissions++;
        sourceSubscriber?.next(undefined);
      },
      complete: () => {
        completed = true;
      },
    });
    sourceSubscriber?.next(undefined);

    expect(emissions).toBe(5);
    expect(completed).toBe(true);
    expect(sourceSubscriber?.active).toBe(false);
  });

  it('retains the RxJS runtime coercion behavior for a numeric string', () => {
    const results: Array<number | 'complete'> = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
    });

    source[take]('2' as unknown as number).subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([1, 2, 'complete']);
  });

  it('shares one ref-counted source activation and restarts after completion', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
    });
    const taken = source[take](2);
    const firstController = new AbortController();
    const firstResults: Array<number | 'complete'> = [];
    const secondResults: Array<number | 'complete'> = [];
    const restartedResults: Array<number | 'complete'> = [];

    taken.subscribe(
      {
        next: (value) => firstResults.push(value),
        complete: () => firstResults.push('complete'),
      },
      { signal: firstController.signal }
    );
    taken.subscribe({
      next: (value) => secondResults.push(value),
      complete: () => secondResults.push('complete'),
    });

    expect(sourceSubscribers).toHaveLength(1);
    const firstSource = sourceSubscribers[0]!;
    firstSource.next(1);
    firstController.abort();
    expect(firstSource.active).toBe(true);
    firstSource.next(2);

    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1, 2, 'complete']);
    expect(firstSource.active).toBe(false);

    taken.subscribe({
      next: (value) => restartedResults.push(value),
      complete: () => restartedResults.push('complete'),
    });
    expect(sourceSubscribers).toHaveLength(2);
    const secondSource = sourceSubscribers[1]!;
    secondSource.next(3);
    secondSource.next(4);

    expect(restartedResults).toEqual([3, 4, 'complete']);
    expect(secondSource.active).toBe(false);
  });

  it('installs only the exported Symbol and leaves the platform take method intact', () => {
    const source = new Observable<number>(() => {});
    type HasStringNamedRxjsTake = Observable<number> extends { rxjsTake: unknown } ? true : false;

    expectTypeOf<HasStringNamedRxjsTake>().toEqualTypeOf<false>();
    expect(source[take]).toBeTypeOf('function');
    expect(source[take]).not.toBe(source.take);
    expect('rxjsTake' in source).toBe(false);
  });
});
