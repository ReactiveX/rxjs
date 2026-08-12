import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type CountSymbol = typeof import('./count.js').count;

let count: CountSymbol;
let hadStringCount: boolean;

beforeAll(async () => {
  hadStringCount = 'count' in Observable.prototype;
  ({ count } = await import('./count.js'));
});

describe('count', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringCount).toBe(false);
    expect('count' in Observable.prototype).toBe(false);
    expect(count.description).toBe('count');
    expect(Symbol.keyFor(count)).toBeUndefined();
  });

  it('counts every value and emits zero for an empty source', () => {
    const many: Array<number | 'complete'> = [];
    const empty: Array<number | 'complete'> = [];

    fromValues(1, 2, 3)[count]().subscribe({
      next: (value) => many.push(value),
      complete: () => many.push('complete'),
    });
    fromValues<number>()[count]().subscribe({
      next: (value) => empty.push(value),
      complete: () => empty.push('complete'),
    });

    expect(many).toEqual([3, 'complete']);
    expect(empty).toEqual([0, 'complete']);
  });

  it('counts predicate matches with a zero-based index', () => {
    const calls: Array<[string, number]> = [];
    const results: number[] = [];
    const counted = fromValues('a', 'bb', 'c', 'dddd')[count]((value, index) => {
      calls.push([value, index]);
      return value.length === index;
    });
    expectTypeOf(counted).toEqualTypeOf<Observable<number>>();

    counted.subscribe((value) => results.push(value));

    expect(calls).toEqual([
      ['a', 0],
      ['bb', 1],
      ['c', 2],
      ['dddd', 3],
    ]);
    expect(results).toEqual([0]);
  });

  it('forwards source errors without emitting a count', () => {
    const failure = new Error('source failed');
    const events: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.next(1);
      subscriber.error(failure);
    });

    source[count]().subscribe({
      next: (value) => events.push(value),
      error: (error) => events.push(error),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([failure]);
  });

  it('turns a predicate error into a stream error and cancels synchronous source work', () => {
    const failure = new Error('predicate failed');
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
      [count]((value) => {
        if (value === 2) {
          throw failure;
        }
        return true;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(errors).toEqual([failure]);
    expect(produced).toEqual([1, 2]);
  });

  it('shares the count, ref-counts cancellation, and restarts after the last observer leaves', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const counted = source[count]();
    const firstResults: number[] = [];
    const secondResults: number[] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    counted.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    counted.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next(1);

    expect(sourceActivations).toBe(1);

    firstController.abort();
    sourceSubscriber?.next(2);
    sourceSubscriber?.complete();

    expect(firstResults).toEqual([]);
    expect(secondResults).toEqual([2]);
    expect(sourceTeardowns).toBe(1);

    counted.subscribe((value) => firstResults.push(value));
    sourceSubscriber?.next(3);
    sourceSubscriber?.complete();

    expect(sourceActivations).toBe(2);
    expect(firstResults).toEqual([1]);
    expect(sourceTeardowns).toBe(2);
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
