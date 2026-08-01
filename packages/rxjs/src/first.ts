import { create } from './create.js';
import { EmptyError } from './empty-error.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';
type TruthyTypesOf<T> = T extends Falsy ? never : T;

export const first: unique symbol = Symbol('first');

declare global {
  interface Observable<T> {
    [first]: {
      <D = T>(predicate?: null, defaultValue?: D): Observable<T | D>;
      (predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
      <D>(predicate: BooleanConstructor, defaultValue: D): Observable<TruthyTypesOf<T> | D>;
      <S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): Observable<S>;
      <S extends T, D>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue: D): Observable<S | D>;
      <D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): Observable<T | D>;
    };
  }
}

function firstOperator<T, D = T>(this: Observable<T>, predicate?: null, defaultValue?: D): Observable<T | D>;
function firstOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
function firstOperator<T, D>(this: Observable<T>, predicate: BooleanConstructor, defaultValue: D): Observable<TruthyTypesOf<T> | D>;
function firstOperator<T, S extends T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): Observable<S>;
function firstOperator<T, S extends T, D>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue: D
): Observable<S | D>;
function firstOperator<T, D = T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): Observable<T | D>;
function firstOperator<T, D>(
  this: Observable<T>,
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): Observable<T | D> {
  const source = this;
  const hasDefaultValue = arguments.length >= 2;

  return source[create]((subscriber) => {
    let index = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          let matches = true;

          if (predicate) {
            matches = predicate(value, index++, source);
          }

          if (matches) {
            sourceController.abort();
            subscriber.next(value);
            subscriber.complete();
          }
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => {
          sourceController.abort();
          if (hasDefaultValue) {
            subscriber.next(defaultValue as D);
            subscriber.complete();
          } else {
            subscriber.error(new EmptyError());
          }
        },
      },
      sourceController.signal
    );
  });
}

Observable.prototype[first] = firstOperator;
