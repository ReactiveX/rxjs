import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { pairwise } from './pairwise.js';

describe('pairwise', () => {
  it('installs only an exact Symbol-keyed operator and isolates same-description Symbols', () => {
    const source = new Observable<number>(() => {});
    const collision = Symbol('pairwise');
    const collidingMethod = () => 'collision';
    type HasStringNamedPairwise = Observable<number> extends { pairwise: unknown } ? true : false;

    Reflect.set(source, collision, collidingMethod);

    expectTypeOf<HasStringNamedPairwise>().toEqualTypeOf<false>();
    expect(pairwise.description).toBe('pairwise');
    expect(Symbol.keyFor(pairwise)).toBeUndefined();
    expect(collision).not.toBe(pairwise);
    expect(Reflect.get(source, collision)).toBe(collidingMethod);
    expect(source[pairwise]).toBe(Observable.prototype[pairwise]);
    expect('pairwise' in source).toBe(false);
  });

  it('suppresses the first value, then emits consecutive tuples synchronously', () => {
    const events: Array<[number, number] | 'complete'> = [];
    const output = fromValues(1, 2, 3, 4)[pairwise]();

    expectTypeOf(output).toEqualTypeOf<Observable<[number, number]>>();

    output.subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
      'complete',
    ]);
  });

  it('preserves undefined values as tuple members', () => {
    const results: Array<[number | undefined, number | undefined]> = [];

    fromValues<number | undefined>(undefined, 1, undefined)[pairwise]().subscribe((value) => results.push(value));

    expect(results).toEqual([
      [undefined, 1],
      [1, undefined],
    ]);
  });

  it('does not emit partial state and forwards completion and errors unchanged', () => {
    const failure = new Error('source failed');
    const completionEvents: Array<[number, number] | 'complete'> = [];
    const errorEvents: Array<[number, number]> = [];
    const errors: unknown[] = [];

    fromValues(1)[pairwise]().subscribe({
      next: (value) => completionEvents.push(value),
      complete: () => completionEvents.push('complete'),
    });
    new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    })
      [pairwise]()
      .subscribe({
        next: (value) => errorEvents.push(value),
        error: (error) => errors.push(error),
      });

    expect(completionEvents).toEqual(['complete']);
    expect(errorEvents).toEqual([]);
    expect(errors).toEqual([failure]);
  });

  it('updates previous state before delivery so reentrant values form consecutive pairs', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    const results: Array<[number, number]> = [];
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
    });

    source[pairwise]().subscribe((pair) => {
      results.push(pair);
      if (pair[1] === 2) {
        sourceSubscriber?.next(3);
      }
    });

    sourceSubscriber?.next(1);
    sourceSubscriber?.next(2);

    expect(results).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });

  it('propagates synchronous downstream cancellation to source work', () => {
    const produced: number[] = [];
    const results: Array<[number, number]> = [];
    const controller = new AbortController();
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3, 4]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[pairwise]().subscribe(
      (value) => {
        results.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(produced).toEqual([1, 2]);
    expect(results).toEqual([[1, 2]]);
  });

  it('shares pair state, ref-counts source work, and resets state on restart', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const paired = source[pairwise]();
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: Array<[number, number]> = [];
    const secondResults: Array<[number, number]> = [];

    paired.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    paired.subscribe((value) => secondResults.push(value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next(1);
    sourceSubscribers[0]?.next(2);
    expect(firstResults).toEqual([[1, 2]]);
    expect(secondResults).toEqual([[1, 2]]);

    firstController.abort();
    sourceSubscribers[0]?.next(3);
    expect(firstResults).toEqual([[1, 2]]);
    expect(secondResults).toEqual([
      [1, 2],
      [2, 3],
    ]);
    expect(sourceSubscribers[0]?.active).toBe(true);

    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: Array<[number, number]> = [];
    paired.subscribe((value) => restartedResults.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next(4);
    expect(restartedResults).toEqual([]);
    sourceSubscribers[1]?.next(5);
    expect(restartedResults).toEqual([[4, 5]]);
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
