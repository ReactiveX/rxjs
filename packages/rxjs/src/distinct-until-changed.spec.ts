import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type DistinctUntilChangedSymbol = typeof import('./distinct-until-changed.js').distinctUntilChanged;

let distinctUntilChanged: DistinctUntilChangedSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'distinctUntilChanged' in Observable.prototype;
  ({ distinctUntilChanged } = await import('./distinct-until-changed.js'));
});

describe('distinctUntilChanged', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringMethod).toBe(false);
    expect('distinctUntilChanged' in Observable.prototype).toBe(false);
    expect(distinctUntilChanged.description).toBe('distinctUntilChanged');
    expect(Symbol.keyFor(distinctUntilChanged)).toBeUndefined();
  });

  it('uses RxJS 7 strict equality and compares against the last emitted value', () => {
    const firstObject = { id: 1 };
    const secondObject = { id: 1 };
    const results: unknown[] = [];

    fromValues<number | typeof firstObject>(NaN, NaN, 0, -0, firstObject, firstObject, secondObject)
      [distinctUntilChanged]()
      .subscribe((value) => results.push(value));

    expect(results).toEqual([NaN, NaN, 0, firstObject, secondObject]);
  });

  it('selects every key, emits the first value, and supports a nullable default comparator', () => {
    interface Entry {
      label: string;
    }

    const selected: string[] = [];
    const results: string[] = [];
    const source = fromValues<Entry>({ label: 'Alpha' }, { label: 'ALPHA' }, { label: 'Beta' }, { label: 'BETA' });

    const distinct = source[distinctUntilChanged](
      null,
      (value) => {
        selected.push(value.label);
        return value.label.toLowerCase();
      }
    );
    expectTypeOf(distinct).toEqualTypeOf<Observable<Entry>>();
    distinct.subscribe((value) => results.push(value.label));

    expect(selected).toEqual(['Alpha', 'ALPHA', 'Beta', 'BETA']);
    expect(results).toEqual(['Alpha', 'Beta']);
  });

  it('supports a custom comparator over selected keys', () => {
    const comparisons: Array<[number, number]> = [];
    const results: number[] = [];

    fromValues(1, 2, 3, 4, 5)
      [distinctUntilChanged](
        (previous: number, current: number) => {
          comparisons.push([previous, current]);
          return previous === current;
        },
        (value) => value % 2
      )
      .subscribe((value) => results.push(value));

    expect(comparisons).toEqual([
      [1, 0],
      [0, 1],
      [1, 0],
      [0, 1],
    ]);
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it('errors and cancels synchronous source work when the key selector throws', () => {
    const failure = new Error('key selection failed');
    const produced: number[] = [];
    const results: number[] = [];
    const errors: unknown[] = [];
    const source = synchronousValues([1, 2, 3], produced);

    source
      [distinctUntilChanged](undefined, (value) => {
        if (value === 2) {
          throw failure;
        }
        return value;
      })
      .subscribe({
        next: (value) => results.push(value),
        error: (error) => errors.push(error),
      });

    expect(produced).toEqual([1, 2]);
    expect(results).toEqual([1]);
    expect(errors).toEqual([failure]);
  });

  it('errors and cancels synchronous source work when the comparator throws', () => {
    const failure = new Error('comparison failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    const source = synchronousValues([1, 2, 3], produced);

    source
      [distinctUntilChanged]((previous, current) => {
        if (current === 2) {
          throw failure;
        }
        return previous === current;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(produced).toEqual([1, 2]);
    expect(errors).toEqual([failure]);
  });

  it('updates comparison state before delivery so reentrant duplicate values stay suppressed', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    const results: number[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceSubscriber = subscriber;
    });

    source[distinctUntilChanged]().subscribe((value) => {
      results.push(value);
      sourceSubscriber?.next(value);
    });
    sourceSubscriber?.next(1);

    expect(results).toEqual([1]);
  });

  it('propagates synchronous downstream cancellation to source work', () => {
    const produced: number[] = [];
    const results: number[] = [];
    const controller = new AbortController();
    const source = synchronousValues([1, 2, 3], produced);

    source[distinctUntilChanged]().subscribe(
      (value) => {
        results.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(produced).toEqual([1]);
    expect(results).toEqual([1]);
  });

  it('forwards source completion and errors unchanged', () => {
    const failure = new Error('source failed');
    const completeEvents: Array<number | 'complete'> = [];
    const errors: unknown[] = [];

    fromValues(1, 1)[distinctUntilChanged]().subscribe({
      next: (value) => completeEvents.push(value),
      complete: () => completeEvents.push('complete'),
    });
    new Observable<number>((subscriber) => subscriber.error(failure))[distinctUntilChanged]().subscribe({
      error: (error) => errors.push(error),
    });

    expect(completeEvents).toEqual([1, 'complete']);
    expect(errors).toEqual([failure]);
  });

  it('shares comparison state, ref-counts source work, and resets state on restart', () => {
    const sourceSubscribers: Subscriber<number>[] = [];
    let teardowns = 0;
    let comparisons = 0;
    const source = new Observable<number>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => teardowns++);
    });
    const distinct = source[distinctUntilChanged]((previous, current) => {
      comparisons++;
      return previous === current;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    distinct.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    distinct.subscribe((value) => secondResults.push(value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next(1);
    sourceSubscribers[0]?.next(1);
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1]);
    expect(comparisons).toBe(1);

    firstController.abort();
    sourceSubscribers[0]?.next(2);
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1, 2]);
    expect(sourceSubscribers[0]?.active).toBe(true);

    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(teardowns).toBe(1);

    const restartedResults: number[] = [];
    distinct.subscribe((value) => restartedResults.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next(2);

    expect(restartedResults).toEqual([2]);
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

function synchronousValues<T>(values: readonly T[], produced: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      if (!subscriber.active) {
        break;
      }
      produced.push(value);
      subscriber.next(value);
    }
  });
}
