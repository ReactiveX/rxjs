import { create } from './create.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';

export const every: unique symbol = Symbol('every');

declare global {
  interface Observable<T> {
    [every]: {
      (predicate: BooleanConstructor): Observable<Exclude<T, Falsy> extends never ? false : boolean>;
      (predicate: BooleanConstructor, thisArg: unknown): Observable<Exclude<T, Falsy> extends never ? false : boolean>;
      <A>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): Observable<boolean>;
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<boolean>;
    };
  }
}

function everyOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<boolean>;
function everyOperator<T>(this: Observable<T>, predicate: BooleanConstructor, thisArg: unknown): Observable<boolean>;
function everyOperator<T, A>(
  this: Observable<T>,
  predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean,
  thisArg: A
): Observable<boolean>;
function everyOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<boolean>;
function everyOperator<T>(
  this: Observable<T>,
  predicate: (this: unknown, value: T, index: number, source: Observable<T>) => boolean,
  thisArg?: unknown
): Observable<boolean> {
  const source = this;

  return source[create]((subscriber) => {
    let index = 0;
    const sourceController = new AbortController();
    const signal = AbortSignal.any([subscriber.signal, sourceController.signal]);

    const conclude = (result: boolean): void => {
      sourceController.abort();
      subscriber.next(result);
      subscriber.complete();
    };

    source.subscribe(
      {
        next: (value) => {
          let matches: boolean;
          try {
            matches = predicate.call(thisArg, value, index++, source);
          } catch (error) {
            sourceController.abort();
            subscriber.error(error);
            return;
          }

          if (!matches) {
            conclude(false);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => conclude(true),
      },
      { signal }
    );
  });
}

Observable.prototype[every] = everyOperator;
