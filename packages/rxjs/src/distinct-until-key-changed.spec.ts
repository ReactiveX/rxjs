import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import './distinct-until-changed.js';

type DistinctUntilKeyChangedSymbol = typeof import('./distinct-until-key-changed.js').distinctUntilKeyChanged;

let distinctUntilKeyChanged: DistinctUntilKeyChangedSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'distinctUntilKeyChanged' in Observable.prototype;
  ({ distinctUntilKeyChanged } = await import('./distinct-until-key-changed.js'));
});

describe('distinctUntilKeyChanged', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringMethod).toBe(false);
    expect('distinctUntilKeyChanged' in Observable.prototype).toBe(false);
    expect(distinctUntilKeyChanged.description).toBe('distinctUntilKeyChanged');
    expect(Symbol.keyFor(distinctUntilKeyChanged)).toBeUndefined();
  });

  it('uses strict equality on the selected property and compares against the last emitted key', () => {
    type Entry = { value?: number };
    const first = { value: 1 };
    const missing = {};
    const results: Entry[] = [];

    fromValues<Entry>(first, { value: 1 }, missing, {}, { value: 1 }, { value: 2 }, { value: 2 })
      [distinctUntilKeyChanged]('value')
      .subscribe((value) => results.push(value));

    expect(results).toEqual([first, missing, { value: 1 }, { value: 2 }]);
  });

  it('supports a custom property comparator', () => {
    interface Entry {
      label: string;
    }

    const comparisons: Array<[string, string]> = [];
    const results: string[] = [];

    fromValues<Entry>({ label: 'Alpha' }, { label: 'ALPHA' }, { label: 'Beta' }, { label: 'Bravo' })
      [distinctUntilKeyChanged]('label', (previous, current) => {
        comparisons.push([previous, current]);
        return previous[0]?.toLowerCase() === current[0]?.toLowerCase();
      })
      .subscribe((value) => results.push(value.label));

    expect(comparisons).toEqual([
      ['Alpha', 'ALPHA'],
      ['Alpha', 'Beta'],
      ['Beta', 'Bravo'],
    ]);
    expect(results).toEqual(['Alpha', 'Beta']);
  });

  it('accepts symbol keys and preserves the source type', () => {
    const version = Symbol('version');
    interface Versioned {
      name: string;
      [version]: number;
    }

    const source = fromValues<Versioned>(
      { name: 'first', [version]: 1 },
      { name: 'duplicate', [version]: 1 },
      { name: 'second', [version]: 2 }
    );
    const distinct = source[distinctUntilKeyChanged](version);
    const results: string[] = [];

    expectTypeOf(distinct).toEqualTypeOf<Observable<Versioned>>();
    distinct.subscribe((value) => results.push(value.name));

    expect(results).toEqual(['first', 'second']);
  });

  it('errors and cancels synchronous work when property access throws', () => {
    const failure = new Error('property access failed');
    const produced: Array<{ value: number }> = [];
    const errors: unknown[] = [];
    const broken = {
      get value(): number {
        throw failure;
      },
    };
    const source = synchronousValues([{ value: 1 }, broken, { value: 2 }], produced);

    source[distinctUntilKeyChanged]('value').subscribe({
      error: (error) => errors.push(error),
    });

    expect(produced).toEqual([{ value: 1 }, broken]);
    expect(errors).toEqual([failure]);
  });

  it('errors and cancels synchronous work when the comparator throws', () => {
    const failure = new Error('comparison failed');
    const values = [{ value: 1 }, { value: 2 }, { value: 3 }];
    const produced: typeof values = [];
    const errors: unknown[] = [];
    const source = synchronousValues(values, produced);

    source
      [distinctUntilKeyChanged]('value', (previous, current) => {
        if (current === 2) {
          throw failure;
        }
        return previous === current;
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(produced).toEqual(values.slice(0, 2));
    expect(errors).toEqual([failure]);
  });

  it('propagates synchronous downstream cancellation to the source', () => {
    const values = [{ value: 1 }, { value: 2 }, { value: 3 }];
    const produced: typeof values = [];
    const results: number[] = [];
    const controller = new AbortController();
    const source = synchronousValues(values, produced);

    source[distinctUntilKeyChanged]('value').subscribe(
      (value) => {
        results.push(value.value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(produced).toEqual(values.slice(0, 1));
    expect(results).toEqual([1]);
  });

  it('forwards source completion and errors unchanged', () => {
    const failure = new Error('source failed');
    const completeEvents: Array<number | 'complete'> = [];
    const errors: unknown[] = [];

    fromValues({ value: 1 }, { value: 1 })[distinctUntilKeyChanged]('value').subscribe({
      next: (value) => completeEvents.push(value.value),
      complete: () => completeEvents.push('complete'),
    });
    new Observable<{ value: number }>((subscriber) => subscriber.error(failure))[distinctUntilKeyChanged]('value').subscribe({
      error: (error) => errors.push(error),
    });

    expect(completeEvents).toEqual([1, 'complete']);
    expect(errors).toEqual([failure]);
  });

  it('shares selected-key state, ref-counts source work, and resets state on restart', () => {
    const sourceSubscribers: Subscriber<{ value: number }>[] = [];
    let teardowns = 0;
    let comparisons = 0;
    const source = new Observable<{ value: number }>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => teardowns++);
    });
    const distinct = source[distinctUntilKeyChanged]('value', (previous, current) => {
      comparisons++;
      return previous === current;
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    distinct.subscribe((value) => firstResults.push(value.value), { signal: firstController.signal });
    distinct.subscribe((value) => secondResults.push(value.value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next({ value: 1 });
    sourceSubscribers[0]?.next({ value: 1 });
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1]);
    expect(comparisons).toBe(1);

    firstController.abort();
    sourceSubscribers[0]?.next({ value: 2 });
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1, 2]);
    expect(sourceSubscribers[0]?.active).toBe(true);

    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(teardowns).toBe(1);

    const restartedResults: number[] = [];
    distinct.subscribe((value) => restartedResults.push(value.value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next({ value: 2 });

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
