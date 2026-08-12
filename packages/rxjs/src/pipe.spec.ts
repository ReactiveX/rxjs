import { describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { map } from './map.js';
import { pipe } from './pipe.js';
import { scan } from './scan.js';

describe('pipe', () => {
  it('composes instance Symbol transformations with inferred types', () => {
    const result = fromValues(1, 2, 3)[pipe](
      (source) => source[map]((value) => `value:${value}`),
      (source) => source[map]((value) => value.length)
    );
    expectTypeOf(result).toEqualTypeOf<Observable<number>>();

    expect(collect(result)).toEqual([7, 7, 7]);
  });

  it('normalizes static inputs through the active platform constructor', () => {
    class DerivedObservable<T> extends Observable<T> {}
    const result = DerivedObservable[pipe]([1, 2, 3], (source) => source[scan]((total, value) => total + value, 0));

    expect(result).toBeInstanceOf(Observable);
    expect(result).not.toBeInstanceOf(DerivedObservable);
    expect(collect(result)).toEqual([1, 3, 6]);
  });
});

function collect<T>(source: Observable<T>): T[] {
  const values: T[] = [];
  source.subscribe((value) => values.push(value));
  return values;
}

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}
