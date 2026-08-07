import { create } from './create.js';
import type { ObservedValueOf } from './util/types.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const catchError: unique symbol = Symbol('catchError');

declare global {
  interface Observable<T> {
    [catchError]: <Replacement extends ObservableInput<any>>(
      selector: (error: any, caught: Observable<T>) => Replacement
    ) => Observable<T | ObservedValueOf<Replacement>>;
  }
}

Observable.prototype[catchError] = function <T, Replacement extends ObservableInput<any>>(
  this: Observable<T>,
  selector: (error: any, caught: Observable<T>) => Replacement
): Observable<T | ObservedValueOf<Replacement>> {
  const source = this;
  let caught!: Observable<T>;

  const result = source[create]<T | ObservedValueOf<Replacement>>((subscriber) => {
    let sourceSubscribeInProgress = false;
    let restartRequested = false;

    const startSource = () => {
      if (!subscriber.active) {
        return;
      }
      if (sourceSubscribeInProgress) {
        restartRequested = true;
        return;
      }

      do {
        restartRequested = false;
        const sourceController = new AbortController();
        sourceSubscribeInProgress = true;

        let sourceTerminated = false;
        const handleSourceError = (error: any) => {
          if (sourceTerminated) {
            return;
          }
          sourceTerminated = true;
          sourceController.abort();

          const replacementInput = selector(error, caught);

          if (!subscriber.active) {
            return;
          }
          if (Object.is(replacementInput, caught)) {
            startSource();
            return;
          }

          const replacement = Observable.from(replacementInput);
          subscribeToSource(replacement, subscriber);
        };

        subscribeToSource(
          source,
          subscriber,
          {
            error: handleSourceError,
            complete: () => {
              sourceTerminated = true;
              subscriber.complete();
            },
          },
          sourceController.signal
        );

        sourceSubscribeInProgress = false;
      } while (restartRequested && subscriber.active);
    };

    startSource();
  });

  caught = result as Observable<T>;
  return result;
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `catchError` form of the exact-Symbol `[catchError]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[catchError]` to its source.
 */
export function pipeableCatchError<T, Replacement extends ObservableInput<any>>(selector: (error: any, caught: Observable<T>) => Replacement): (source: Observable<T>) => Observable<T | ObservedValueOf<Replacement>>;
export function pipeableCatchError(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[catchError] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
