import { create } from './create.js';

export const finalize: unique symbol = Symbol('finalize');

declare global {
  interface Observable<T> {
    [finalize]: (callback: () => void) => Observable<T>;
  }
}

Observable.prototype[finalize] = function <T>(this: Observable<T>, callback: () => void): Observable<T> {
  return this[create]((subscriber) => {
    let finalized = false;
    let sourceTerminated = false;

    const finalizeOnce = () => {
      if (!finalized) {
        finalized = true;
        callback();
      }
    };

    subscriber.addTeardown(() => {
      if (!sourceTerminated) {
        finalizeOnce();
      }
    });

    this.subscribe(
      {
        next: (value) => subscriber.next(value),
        error: (error) => {
          sourceTerminated = true;
          try {
            subscriber.error(error);
          } finally {
            finalizeOnce();
          }
        },
        complete: () => {
          sourceTerminated = true;
          try {
            subscriber.complete();
          } finally {
            finalizeOnce();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `finalize` form of the exact-Symbol `[finalize]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[finalize]` to its source.
 */
export function pipeableFinalize<T>(callback: () => void): (source: Observable<T>) => Observable<T>;
export function pipeableFinalize(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[finalize] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
