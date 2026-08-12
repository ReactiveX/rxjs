import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type SkipSymbol = typeof import('./skip.js').skip;

let skip: SkipSymbol;
let hadStringSkip: boolean;

beforeAll(async () => {
  hadStringSkip = 'skip' in Observable.prototype;
  ({ skip } = await import('./skip.js'));
});

describe('skip', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringSkip).toBe(false);
    expect('skip' in Observable.prototype).toBe(false);
    expect(skip.description).toBe('skip');
    expect(Symbol.keyFor(skip)).toBeUndefined();
  });

  it('skips the requested number of values and preserves the source type', () => {
    const results: Array<number | 'complete'> = [];
    const skipped = fromValues(1, 2, 3, 4)[skip](2);
    expectTypeOf(skipped).toEqualTypeOf<Observable<number>>();

    skipped.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual([3, 4, 'complete']);
  });

  it('mirrors all values for zero and negative counts', () => {
    const zero: number[] = [];
    const negative: number[] = [];

    fromValues(1, 2)[skip](0).subscribe((value) => zero.push(value));
    fromValues(1, 2)[skip](-42).subscribe((value) => negative.push(value));

    expect(zero).toEqual([1, 2]);
    expect(negative).toEqual([1, 2]);
  });

  it('skips all finite values for an infinite or NaN count', () => {
    const infinite: number[] = [];
    const notANumber: number[] = [];

    fromValues(1, 2)[skip](Infinity).subscribe((value) => infinite.push(value));
    fromValues(1, 2)[skip](NaN).subscribe((value) => notANumber.push(value));

    expect(infinite).toEqual([]);
    expect(notANumber).toEqual([]);
  });

  it('forwards completion and source errors regardless of the remaining count', () => {
    const failure = new Error('source failed');
    const completeEvents: string[] = [];
    const errors: unknown[] = [];

    fromValues<number>()[skip](3).subscribe({
      complete: () => completeEvents.push('complete'),
    });
    new Observable<number>((subscriber) => subscriber.error(failure))[skip](3).subscribe({
      error: (error) => errors.push(error),
    });

    expect(completeEvents).toEqual(['complete']);
    expect(errors).toEqual([failure]);
  });

  it('propagates synchronous downstream cancellation to the source', () => {
    const produced: number[] = [];
    const results: number[] = [];
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

    source[skip](1).subscribe(
      (value) => {
        results.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(produced).toEqual([1, 2]);
    expect(results).toEqual([2]);
  });

  it('shares skip state, ref-counts source work, and resets state on restart', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const skipped = source[skip](2);
    const firstResults: number[] = [];
    const secondResults: number[] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    skipped.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    skipped.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next(1);
    sourceSubscriber?.next(2);
    sourceSubscriber?.next(3);

    expect(sourceActivations).toBe(1);
    expect(firstResults).toEqual([3]);
    expect(secondResults).toEqual([3]);

    firstController.abort();
    sourceSubscriber?.next(4);

    expect(firstResults).toEqual([3]);
    expect(secondResults).toEqual([3, 4]);
    expect(sourceSubscriber?.active).toBe(true);

    secondController.abort();
    expect(sourceSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    skipped.subscribe((value) => restartedResults.push(value));
    sourceSubscriber?.next(5);
    sourceSubscriber?.next(6);
    sourceSubscriber?.next(7);

    expect(sourceActivations).toBe(2);
    expect(restartedResults).toEqual([7]);
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
