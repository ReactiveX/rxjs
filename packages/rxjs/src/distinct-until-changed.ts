import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Comparator<T> = (previous: T, current: T) => boolean;
type KeySelector<T, K> = (value: T) => K;

export const distinctUntilChanged: unique symbol = Symbol('distinctUntilChanged');

declare global {
  interface Observable<T> {
    [distinctUntilChanged]: {
      (comparator?: Comparator<T> | null): Observable<T>;
      <K>(comparator: Comparator<K> | null | undefined, keySelector: KeySelector<T, K>): Observable<T>;
    };
  }
}

function distinctUntilChangedOperator<T>(this: Observable<T>, comparator?: Comparator<T> | null): Observable<T>;
function distinctUntilChangedOperator<T, K>(
  this: Observable<T>,
  comparator: Comparator<K> | null | undefined,
  keySelector: KeySelector<T, K>
): Observable<T>;
function distinctUntilChangedOperator<T, K>(
  this: Observable<T>,
  comparator?: Comparator<K> | null,
  keySelector: KeySelector<T, K> = identity as KeySelector<T, K>
): Observable<T> {
  const compare = comparator ?? defaultCompare;

  return this[create]((subscriber) => {
    let first = true;
    let previousKey: K;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentKey = keySelector(value);
        const distinct = first || !compare(previousKey, currentKey);
        if (distinct) {
          first = false;
          previousKey = currentKey;
          subscriber.next(value);
        }
      },
    });
  });
}

Observable.prototype[distinctUntilChanged] = distinctUntilChangedOperator;

function identity<T>(value: T): T {
  return value;
}

function defaultCompare<T>(previous: T, current: T): boolean {
  return previous === current;
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `distinctUntilChanged` form of the exact-Symbol `[distinctUntilChanged]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[distinctUntilChanged]` to its source.
 */
export function pipeableDistinctUntilChanged<T>(comparator?: Comparator<T> | null): (source: Observable<T>) => Observable<T>;
export function pipeableDistinctUntilChanged<T, K>(comparator: Comparator<K> | null | undefined, keySelector: KeySelector<T, K>): (source: Observable<T>) => Observable<T>;
export function pipeableDistinctUntilChanged(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[distinctUntilChanged] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
