import '@rxjs/observable-polyfill';
import type { UnaryFunction } from './types.js';

/**
 * A minimal compatibility handle for cancelling one Observable observer.
 *
 * `closed` is a live view of the handle's backing `AbortSignal`. It becomes
 * `true` after `unsubscribe()`, source completion, or source error.
 */
export interface Subscription {
  readonly closed: boolean;
  unsubscribe(): void;
}

/**
 * Subscribes to a source and returns a minimal AbortSignal-backed handle.
 *
 * This is an optional compatibility terminal for code that needs the familiar
 * `unsubscribe()` shape. It does not recreate RxJS 7's Subscription tree,
 * teardown aggregation, or `add`/`remove` methods.
 *
 * @typeParam In The source value type.
 * @param observer A next callback or partial Observer.
 * @returns A terminal unary function for use with `rx` or another composition
 * helper.
 *
 * @example Subscribe and cancel through `rx`
 * ```ts
 * import { rx, subscribe } from 'rxjs';
 *
 * const subscription = rx([1, 2, 3], subscribe(console.log));
 * subscription.unsubscribe();
 * console.log(subscription.closed); // true
 * ```
 */
export function subscribe<In>(
  observer?: Partial<Observer<In>> | ((value: In) => void) | null
): UnaryFunction<Observable<In>, Subscription> {
  return (source) => {
    const controller = new AbortController();
    const destination = typeof observer === 'function' ? { next: observer } : observer;

    source.subscribe(
      {
        next(value) {
          destination?.next?.(value);
        },
        error(error) {
          try {
            if (destination?.error) {
              destination.error(error);
            } else {
              throw error;
            }
          } finally {
            controller.abort(error);
          }
        },
        complete() {
          try {
            destination?.complete?.();
          } finally {
            controller.abort();
          }
        },
      },
      { signal: controller.signal }
    );

    return {
      get closed() {
        return controller.signal.aborted;
      },
      unsubscribe() {
        controller.abort();
      },
    };
  };
}
