import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type MapSymbol = typeof import('./map.js').map;

let map: MapSymbol;
let platformMap: Observable<unknown>['map'];

beforeAll(async () => {
  platformMap = Observable.prototype.map;
  ({ map } = await import('./map.js'));
});

describe('map', () => {
  it('installs an exact Symbol-keyed operator without changing the platform string method', () => {
    expect(map.description).toBe('map');
    expect(Symbol.keyFor(map)).toBeUndefined();
    expect(Observable.prototype.map).toBe(platformMap);
    expect(Observable.prototype[map]).not.toBe(platformMap);
  });

  it('maps values with a zero-based index and preserves the projected type', () => {
    const calls: Array<[number, number]> = [];
    const source = fromValues(2, 4, 6);

    const mapped = source[map]((value, index) => {
      calls.push([value, index]);
      return `${index}:${value * 10}`;
    });
    expectTypeOf(mapped).toEqualTypeOf<Observable<string>>();

    const results: Array<string | 'complete'> = [];
    mapped.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(calls).toEqual([
      [2, 0],
      [4, 1],
      [6, 2],
    ]);
    expect(results).toEqual(['0:20', '1:40', '2:60', 'complete']);
  });

  it('does not invoke the projector for an empty source and forwards completion', () => {
    const project = () => {
      throw new Error('project should not run');
    };
    const results: string[] = [];
    const source = new Observable<number>((subscriber) => subscriber.complete());

    source[map](project).subscribe({
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['complete']);
  });

  it('forwards source errors unchanged', () => {
    const failure = new Error('source failed');
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => subscriber.error(failure));

    source[map]((value) => value * 2).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
  });

  it('forwards projector errors and immediately cancels synchronous source work', () => {
    const failure = new Error('projection failed');
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

    source[map]((value) => {
      if (value === 2) {
        throw failure;
      }
      return value;
    }).subscribe({
      error: (error) => errors.push(error),
    });

    expect(errors).toEqual([failure]);
    expect(produced).toEqual([1, 2]);
  });

  it('shares projector and source work, ref-counts cancellation, and resets the index on restart', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    let projections = 0;
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const mapped = source[map]((value, index) => {
      projections++;
      return `${index}:${value}`;
    });
    const firstResults: string[] = [];
    const secondResults: string[] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    mapped.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    mapped.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next(1);

    expect(firstResults).toEqual(['0:1']);
    expect(secondResults).toEqual(['0:1']);
    expect(projections).toBe(1);
    expect(sourceActivations).toBe(1);

    firstController.abort();
    sourceSubscriber?.next(2);

    expect(firstResults).toEqual(['0:1']);
    expect(secondResults).toEqual(['0:1', '1:2']);
    expect(projections).toBe(2);
    expect(sourceSubscriber?.active).toBe(true);

    secondController.abort();

    expect(sourceSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);

    const restartedResults: string[] = [];
    mapped.subscribe((value) => restartedResults.push(value));
    sourceSubscriber?.next(3);

    expect(restartedResults).toEqual(['0:3']);
    expect(projections).toBe(3);
    expect(sourceActivations).toBe(2);
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
