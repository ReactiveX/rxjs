import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';
type TruthyTypesOf<T> = T extends Falsy ? never : T;

export const filter: unique symbol = Symbol('filter');

declare global {
  interface Observable<T> {
    [filter]: {
      <S extends T>(predicate: (value: T, index: number) => value is S): Observable<S>;
      (predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
      (predicate: (value: T, index: number) => boolean): Observable<T>;
    };
  }
}

function filterOperator<T, S extends T>(this: Observable<T>, predicate: (value: T, index: number) => value is S): Observable<S>;
function filterOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
function filterOperator<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T>;
function filterOperator<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (predicate(value, index++)) {
          subscriber.next(value);
        }
      },
    });
  });
}

Observable.prototype[filter] = filterOperator;
