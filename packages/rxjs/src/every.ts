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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `every` form of the exact-Symbol `[every]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[every]` to its source.
 */
export function pipeableEvery<T>(predicate: BooleanConstructor): (source: Observable<T>) => Observable<Exclude<T, Falsy> extends never ? false : boolean>;
export function pipeableEvery<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean): (source: Observable<T>) => Observable<boolean>;
export function pipeableEvery(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[every] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
