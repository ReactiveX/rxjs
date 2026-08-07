import { create } from './create.js';
import { EmptyError } from './empty-error.js';
import { NotFoundError } from './not-found-error.js';
import { SequenceError } from './sequence-error.js';
import { subscribeToSource } from './util/observable-helpers.js';

type Falsy = null | undefined | false | 0 | -0 | 0n | '';
type TruthyTypesOf<T> = T extends Falsy ? never : T;

export const single: unique symbol = Symbol('single');

declare global {
  interface Observable<T> {
    [single]: {
      (predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
      (predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
    };
  }
}

function singleOperator<T>(this: Observable<T>, predicate: BooleanConstructor): Observable<TruthyTypesOf<T>>;
function singleOperator<T>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T>;
function singleOperator<T>(this: Observable<T>, predicate?: (value: T, index: number, source: Observable<T>) => boolean): Observable<T> {
  const source = this;

  return source[create]((subscriber) => {
    let hasValue = false;
    let singleValue: T | undefined;
    let seenValue = false;
    let index = 0;
    const sourceController = new AbortController();
    subscribeToSource(
      source,
      subscriber,
      {
        next: (value) => {
          seenValue = true;
          let isMatch = true;

          if (predicate) {
            isMatch = predicate(value, index++, source);
          }

          if (!isMatch) {
            return;
          }

          if (hasValue) {
            sourceController.abort();
            subscriber.error(new SequenceError('Too many matching values'));
            return;
          }

          hasValue = true;
          singleValue = value;
        },
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => {
          sourceController.abort();
          if (hasValue) {
            subscriber.next(singleValue as T);
            subscriber.complete();
          } else {
            subscriber.error(seenValue ? new NotFoundError('No matching values') : new EmptyError());
          }
        },
      },
      sourceController.signal
    );
  });
}

Observable.prototype[single] = singleOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `single` form of the exact-Symbol `[single]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[single]` to its source.
 */
export function pipeableSingle<T>(predicate: BooleanConstructor): (source: Observable<T>) => Observable<TruthyTypesOf<T>>;
export function pipeableSingle<T>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): (source: Observable<T>) => Observable<T>;
export function pipeableSingle(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[single] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
