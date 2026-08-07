import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const isEmpty: unique symbol = Symbol('isEmpty');

declare global {
  interface Observable<T> {
    [isEmpty](): Observable<boolean>;
  }
}

function isEmptyOperator<T>(this: Observable<T>): Observable<boolean> {
  const source = this;

  return source[create]((subscriber) => {
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
        next: () => conclude(false),
        error: (error) => {
          sourceController.abort();
          subscriber.error(error);
        },
        complete: () => conclude(true),
      },
      sourceController.signal
    );
  });
}

Observable.prototype[isEmpty] = isEmptyOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `isEmpty` form of the exact-Symbol `[isEmpty]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[isEmpty]` to its source.
 */
export function pipeableIsEmpty<T>(): (source: Observable<T>) => Observable<boolean>;
export function pipeableIsEmpty(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[isEmpty] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
