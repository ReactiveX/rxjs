import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const find: unique symbol = Symbol('find');

declare global {
  interface Observable<T> {
    [find]: {
      <S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S): Observable<S | undefined>;
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<T | undefined>;
    };
  }
}

function findOperator<T, S extends T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => value is S
): Observable<S | undefined>;
function findOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<T | undefined>;
function findOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<T | undefined> {
  const source = this;

  return source[create]((subscriber) => {
    let index = 0;
    const sourceController = new AbortController();

    const conclude = (value: T | undefined): void => {
      sourceController.abort();
      subscriber.next(value);
      subscriber.complete();
    };

    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          if (predicate(value, index++, source)) {
            conclude(value);
          }
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => conclude(undefined),
      },
      sourceController.signal
    );
  });
}

Observable.prototype[find] = findOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `find` form of the exact-Symbol `[find]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[find]` to its source.
 */
export function pipeableFind<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S): (source: Observable<T>) => Observable<S | undefined>;
export function pipeableFind<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): (source: Observable<T>) => Observable<T | undefined>;
export function pipeableFind(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[find] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
