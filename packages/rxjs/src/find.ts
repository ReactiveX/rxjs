import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const find: unique symbol = Symbol('find');

declare global {
  interface Observable<T> {
    [find]: {
      <S extends T, A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => value is S, thisArg: A): Observable<
        S | undefined
      >;
      <S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S): Observable<S | undefined>;
      <A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): Observable<T | undefined>;
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<T | undefined>;
    };
  }
}

function findOperator<T, S extends T, A>(
  this: Observable<T>,
  predicate: (this: A, value: T, index: number, source: Observable<T>) => value is S,
  thisArg: A
): Observable<S | undefined>;
function findOperator<T, S extends T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => value is S
): Observable<S | undefined>;
function findOperator<T, A>(
  this: Observable<T>,
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): Observable<T | undefined>;
function findOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<T | undefined>;
function findOperator<T>(
  this: Observable<T>,
  predicate: (this: unknown, value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: unknown
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
          if (predicate.call(thisArg, value, index++, source)) {
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
