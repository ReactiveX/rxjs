import { create } from './create.js';
import { EmptyError } from './empty-error.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';
type TruthyTypesOf<T> = T extends Falsy ? never : T;

export const last: unique symbol = Symbol('last');

declare global {
  interface Observable<T> {
    [last]: {
      (predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
      <D>(predicate: BooleanConstructor, defaultValue: D): Observable<TruthyTypesOf<T> | D>;
      <D = T>(predicate?: null, defaultValue?: D): Observable<T | D>;
      <S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): Observable<S>;
      <D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): Observable<T | D>;
    };
  }
}

function lastOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
function lastOperator<T, D>(this: Observable<T>, predicate: BooleanConstructor, defaultValue: D): Observable<TruthyTypesOf<T> | D>;
function lastOperator<T, D = T>(this: Observable<T>, predicate?: null, defaultValue?: D): Observable<T | D>;
function lastOperator<T, S extends T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => value is S,
  defaultValue?: S
): Observable<S>;
function lastOperator<T, D = T>(
  this: Observable<T>,
  predicate: (value: T, index: number, source: Observable<T>) => boolean,
  defaultValue?: D
): Observable<T | D>;
function lastOperator<T, D>(
  this: Observable<T>,
  predicate?: ((value: T, index: number, source: Observable<T>) => boolean) | null,
  defaultValue?: D
): Observable<T | D> {
  const source = this;
  const hasDefaultValue = arguments.length >= 2;

  return source[create]((subscriber) => {
    let hasValue = false;
    let lastValue: T | undefined;
    let index = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          if (predicate) {
            if (!predicate(value, index++, source)) {
              return;
            }
          }

          hasValue = true;
          lastValue = value;
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => {
          sourceController.abort();

          if (hasValue) {
            subscriber.next(lastValue as T);
            subscriber.complete();
          } else if (hasDefaultValue) {
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

Observable.prototype[last] = lastOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `last` form of the exact-Symbol `[last]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[last]` to its source.
 */
export function pipeableLast<T>(predicate: BooleanConstructor): (source: Observable<T>) => Observable<TruthyTypesOf<T>>;
export function pipeableLast<T, D>(predicate: BooleanConstructor, defaultValue: D): (source: Observable<T>) => Observable<TruthyTypesOf<T> | D>;
export function pipeableLast<T, D = T>(predicate?: null, defaultValue?: D): (source: Observable<T>) => Observable<T | D>;
export function pipeableLast<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): (source: Observable<T>) => Observable<S>;
export function pipeableLast<T, D = T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): (source: Observable<T>) => Observable<T | D>;
export function pipeableLast(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[last] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
