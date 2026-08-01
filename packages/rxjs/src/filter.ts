import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';
type TruthyTypesOf<T> = T extends Falsy ? never : T;

export const filter: unique symbol = Symbol('filter');

declare global {
  interface Observable<T> {
    [filter]: {
      <S extends T, A>(predicate: (this: A, value: T, index: number) => value is S, thisArg: A): Observable<S>;
      <S extends T>(predicate: (value: T, index: number) => value is S): Observable<S>;
      (predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
      <A>(predicate: (this: A, value: T, index: number) => boolean, thisArg: A): Observable<T>;
      (predicate: (value: T, index: number) => boolean): Observable<T>;
    };
  }
}

function filterOperator<T, S extends T, A>(
  this: Observable<T>,
  predicate: (this: A, value: T, index: number) => value is S,
  thisArg: A
): Observable<S>;
function filterOperator<T, S extends T>(this: Observable<T>, predicate: (value: T, index: number) => value is S): Observable<S>;
function filterOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
function filterOperator<T, A>(this: Observable<T>, predicate: (this: A, value: T, index: number) => boolean, thisArg: A): Observable<T>;
function filterOperator<T>(this: Observable<T>, predicate: (value: T, index: number) => boolean): Observable<T>;
function filterOperator<T>(
  this: Observable<T>,
  predicate: (this: unknown, value: T, index: number) => boolean,
  thisArg?: unknown
): Observable<T> {
  return this[create]((subscriber) => {
    let index = 0;

    this.subscribe(
      {
        next: (value) => {
          let result: boolean;
          try {
            result = predicate.call(thisArg, value, index++);
          } catch (error) {
            subscriber.error(error);
            return;
          }

          if (result) {
            subscriber.next(value);
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => subscriber.complete(),
      },
      { signal: subscriber.signal }
    );
  });
}

installObservableExtension({ instance: filterOperator, name: 'filter', symbol: filter });
