import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import './reduce.js';

type MaxSymbol = typeof import('./max.js').max;

let max: MaxSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'max' in Observable.prototype;
  ({ max } = await import('./max.js'));
});

describe('max', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringMethod).toBe(false);
    expect('max' in Observable.prototype).toBe(false);
    expect(max.description).toBe('max');
    expect(Symbol.keyFor(max)).toBeUndefined();
  });

  it('selects the greatest value with the RxJS 7 default comparison', () => {
    const numberEvents: Array<number | 'complete'> = [];
    const stringEvents: Array<string | 'complete'> = [];

    fromValues(42, -1, 3)[max]().subscribe({
      next: (value) => numberEvents.push(value),
      complete: () => numberEvents.push('complete'),
    });
    fromValues('a', 'c', 'b')[max]().subscribe({
      next: (value) => stringEvents.push(value),
      complete: () => stringEvents.push('complete'),
    });

    expect(numberEvents).toEqual([42, 'complete']);
    expect(stringEvents).toEqual(['c', 'complete']);
  });

  it('uses the first value as state and calls an optional comparer as previous then current', () => {
    interface Entry {
      score: number;
      label: string;
    }

    const first: Entry = { score: 2, label: 'first' };
    const second: Entry = { score: 5, label: 'second' };
    const third: Entry = { score: 3, label: 'third' };
    const comparisons: Array<[Entry, Entry]> = [];
    const results: Entry[] = [];
    const result = fromValues(first, second, third)[max]((previous, current) => {
      comparisons.push([previous, current]);
      return previous.score - current.score;
    });

    expectTypeOf(result).toEqualTypeOf<Observable<Entry>>();
    result.subscribe((value) => results.push(value));

    expect(comparisons).toEqual([
      [first, second],
      [second, third],
    ]);
    expect(results).toEqual([second]);
  });

  it('allows a comparer to reverse which value is maximal', () => {
    const results: number[] = [];

    fromValues(4, -1, 6)[max]((previous, current) => (previous > current ? -1 : 1)).subscribe((value) =>
      results.push(value)
    );

    expect(results).toEqual([-1]);
  });

  it('completes without emitting when the source is empty', () => {
    const events: string[] = [];

    new Observable<number>((subscriber) => subscriber.complete())[max]().subscribe({
      next: () => events.push('next'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
  });

  it('forwards source errors without emitting accumulated state', () => {
    const failure = new Error('source failed');
    const events: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.error(failure);
    });

    source[max]().subscribe({
      next: (value) => events.push(value),
      error: (error) => events.push(error),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([failure]);
  });

  it('forwards comparer errors and synchronously cancels source work', () => {
    const failure = new Error('comparison failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source
      [max]((_previous, current) => {
        if (current === 2) {
          throw failure;
        }
        return 0;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(produced).toEqual([1, 2]);
    expect(errors).toEqual([failure]);
  });

  it('shares comparer and source work, ref-counts cancellation, and resets on restart', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let sourceTeardowns = 0;
    let comparerCalls = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const maximum = source[max]((previous, current) => {
      comparerCalls++;
      return previous - current;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    maximum.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    maximum.subscribe((value) => secondResults.push(value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next(2);
    sourceSubscribers[0]?.next(5);
    expect(comparerCalls).toBe(1);

    firstController.abort();
    sourceSubscribers[0]?.next(3);
    expect(comparerCalls).toBe(2);
    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([]);
    expect(sourceSubscribers[0]?.active).toBe(true);

    sourceSubscribers[0]?.complete();
    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([5]);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    maximum.subscribe((value) => restartedResults.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next(-1);
    sourceSubscribers[1]?.next(-2);
    sourceSubscribers[1]?.complete();

    expect(restartedResults).toEqual([-1]);
    expect(comparerCalls).toBe(3);
    expect(sourceTeardowns).toBe(2);
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
