import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type PluckSymbol = typeof import('./pluck.js').pluck;

let pluck: PluckSymbol;
let hadStringPluck: boolean;

beforeAll(async () => {
  hadStringPluck = 'pluck' in Observable.prototype;
  ({ pluck } = await import('./pluck.js'));
});

describe('pluck', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringPluck).toBe(false);
    expect('pluck' in Observable.prototype).toBe(false);
    expect(pluck.description).toBe('pluck');
    expect(Symbol.keyFor(pluck)).toBeUndefined();
  });

  it('selects nested string, number, and symbol properties while preserving the result type', () => {
    const leaf = Symbol('leaf');
    interface Model {
      group: {
        entries: Array<{
          detail: {
            metadata: {
              [leaf]: string;
            };
          };
        }>;
      } | null;
    }

    const selected = fromValues<Model>(
      {
        group: {
          entries: [
            {
              detail: {
                metadata: {
                  [leaf]: 'value',
                },
              },
            },
          ],
        },
      },
      { group: null }
    )[pluck]('group', 'entries', 0, 'detail', 'metadata', leaf);
    expectTypeOf(selected).toEqualTypeOf<Observable<string | undefined>>();

    const results: Array<string | undefined | 'complete'> = [];
    selected.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['value', undefined, 'complete']);
  });

  it('returns undefined when any part of the path is null, undefined, or absent', () => {
    interface Model {
      outer?: {
        inner?: {
          value: number;
        } | null;
      };
    }

    const results: Array<number | undefined> = [];
    fromValues<Model>({ outer: { inner: { value: 1 } } }, { outer: { inner: null } }, { outer: {} }, {})
      [pluck]('outer', 'inner', 'value')
      .subscribe((value) => results.push(value));

    expect(results).toEqual([1, undefined, undefined, undefined]);
  });

  it('requires at least one property and throws synchronously before creating an Observable', () => {
    const source = fromValues({ value: 1 });

    expect(() => Reflect.apply(Observable.prototype[pluck], source, [])).toThrowError('list of properties cannot be empty.');
  });

  it('forwards source errors unchanged', () => {
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    const source = new Observable<{ value: number }>((subscriber) => subscriber.error(failure));

    source[pluck]('value').subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
  });

  it('turns property-access errors into stream errors and immediately cancels synchronous source work', () => {
    const failure = new Error('property access failed');
    const produced: object[] = [];
    const errors: unknown[] = [];
    const broken = {
      get value(): number {
        throw failure;
      },
    };
    const values = [{ value: 1 }, broken, { value: 3 }];
    const source = new Observable<(typeof values)[number]>((subscriber) => {
      for (const value of values) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[pluck]('value').subscribe({
      error: (error) => errors.push(error),
    });

    expect(produced).toEqual(values.slice(0, 2));
    expect(errors).toEqual([failure]);
  });

  it('propagates synchronous downstream cancellation to the source', () => {
    const produced: Array<{ value: number }> = [];
    const results: number[] = [];
    const controller = new AbortController();
    const values = [{ value: 1 }, { value: 2 }, { value: 3 }];
    const source = new Observable<{ value: number }>((subscriber) => {
      for (const value of values) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source[pluck]('value').subscribe(
      (value) => {
        results.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );

    expect(produced).toEqual(values.slice(0, 1));
    expect(results).toEqual([1]);
  });

  it('shares property access and source work, ref-counts cancellation, and restarts after the last observer leaves', () => {
    const sourceSubscribers: Subscriber<{ readonly value: number }>[] = [];
    let sourceTeardowns = 0;
    let propertyReads = 0;
    const source = new Observable<{ readonly value: number }>((subscriber) => {
      sourceSubscribers.push(subscriber);
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const selected = source[pluck]('value');
    const firstController = new AbortController();
    const secondController = new AbortController();
    const firstResults: number[] = [];
    const secondResults: number[] = [];

    selected.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    selected.subscribe((value) => secondResults.push(value), { signal: secondController.signal });

    expect(sourceSubscribers).toHaveLength(1);
    sourceSubscribers[0]?.next({
      get value() {
        propertyReads++;
        return 1;
      },
    });
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1]);
    expect(propertyReads).toBe(1);

    firstController.abort();
    sourceSubscribers[0]?.next({
      get value() {
        propertyReads++;
        return 2;
      },
    });
    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1, 2]);
    expect(sourceSubscribers[0]?.active).toBe(true);
    expect(propertyReads).toBe(2);

    secondController.abort();
    expect(sourceSubscribers[0]?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: number[] = [];
    selected.subscribe((value) => restartedResults.push(value));
    expect(sourceSubscribers).toHaveLength(2);
    sourceSubscribers[1]?.next({
      get value() {
        propertyReads++;
        return 3;
      },
    });

    expect(restartedResults).toEqual([3]);
    expect(propertyReads).toBe(3);
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
