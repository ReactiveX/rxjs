import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';

export const every: unique symbol = Symbol('every');

declare global {
  interface Observable<T> {
    [every]: {
      (predicate: BooleanConstructor): Observable<Exclude<T, Falsy> extends never ? false : boolean>;
      (predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<boolean>;
    };
  }
}

function everyOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<boolean>;
function everyOperator<T>(this: Observable<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean): Observable<boolean>;
function everyOperator<T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean
): Observable<boolean> {
  const source = this;

  return source[create]((subscriber) => {
    let index = 0;
    const sourceController = new AbortController();

    const conclude = (result: boolean): void => {
      sourceController.abort();
      subscriber.next(result);
      subscriber.complete();
    };

    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          if (!predicate(value, index++, source)) {
            conclude(false);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => conclude(true),
      },
      sourceController.signal
    );
  });
}

Observable.prototype[every] = everyOperator;
