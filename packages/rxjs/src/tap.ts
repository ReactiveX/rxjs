import { create } from './create.js';

export const tap: unique symbol = Symbol('tap');

export interface TapObserver<T> extends Observer<T> {
  subscribe: () => void;
  unsubscribe: () => void;
  finalize: () => void;
}

declare global {
  interface Observable<T> {
    [tap]: {
      (observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null): Observable<T>;
      (next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Observable<T>;
    };
  }
}

function tapOperator<T>(this: Observable<T>, observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null): Observable<T>;
function tapOperator<T>(
  this: Observable<T>,
  next?: ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Observable<T>;
function tapOperator<T>(
  this: Observable<T>,
  observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null,
  error?: ((error: any) => void) | null,
  complete?: (() => void) | null
): Observable<T> {
  const tapObserver =
    typeof observerOrNext === 'function' || error || complete
      ? {
          next: typeof observerOrNext === 'function' ? observerOrNext : undefined,
          error: error ?? undefined,
          complete: complete ?? undefined,
        }
      : observerOrNext;

  if (!tapObserver) {
    return this;
  }

  return this[create]((subscriber) => {
    try {
      tapObserver.subscribe?.();
    } catch (callbackError) {
      subscriber.error(callbackError);
      return;
    }

    let sourceTerminated = false;
    let finalized = false;
    const finalize = () => {
      if (!finalized) {
        finalized = true;
        tapObserver.finalize?.();
      }
    };

    subscriber.addTeardown(() => {
      if (!sourceTerminated) {
        tapObserver.unsubscribe?.();
        finalize();
      }
    });

    if (!subscriber.active) {
      return;
    }

    this.subscribe(
      {
        next: (value) => {
          try {
            tapObserver.next?.(value);
          } catch (callbackError) {
            subscriber.error(callbackError);
            return;
          }
          subscriber.next(value);
        },
        error: (sourceError) => {
          sourceTerminated = true;
          try {
            tapObserver.error?.(sourceError);
          } catch (callbackError) {
            try {
              subscriber.error(callbackError);
            } finally {
              finalize();
            }
            return;
          }
          try {
            subscriber.error(sourceError);
          } finally {
            finalize();
          }
        },
        complete: () => {
          sourceTerminated = true;
          try {
            tapObserver.complete?.();
          } catch (callbackError) {
            try {
              subscriber.error(callbackError);
            } finally {
              finalize();
            }
            return;
          }
          try {
            subscriber.complete();
          } finally {
            finalize();
          }
        },
      },
      { signal: subscriber.signal }
    );
  });
}

Observable.prototype[tap] = tapOperator;

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `tap` form of the exact-Symbol `[tap]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[tap]` to its source.
 */
export function pipeableTap<T>(observerOrNext?: Partial<TapObserver<T>> | ((value: T) => void) | null): (source: Observable<T>) => Observable<T>;
export function pipeableTap<T>(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): (source: Observable<T>) => Observable<T>;
export function pipeableTap(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[tap] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
