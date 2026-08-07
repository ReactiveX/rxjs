import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const repeat: unique symbol = Symbol('repeat');

declare global {
  interface Observable<T> {
    [repeat]: (config?: { count?: number; delay?: number | ((repeatCount: number) => ObservableInput<any>) }) => Observable<T>;
  }
}

Observable.prototype[repeat] = function <T>(
  this: Observable<T>,
  config?: {
    count?: number;
    delay?: number | ((repeatCount: number) => ObservableInput<any>);
  }
): Observable<T> {
  return this[create]((subscriber) => {
    const { count = Infinity, delay = null } = config ?? {};
    if (count <= 0) {
      subscriber.complete();
      return;
    }

    let id: ReturnType<typeof globalThis.setTimeout> | undefined;
    let repeatCount = 0;
    let subscriptionCount = 0;

    const isTimeoutDelay = typeof delay === 'number';
    if (isTimeoutDelay) {
      subscriber.addTeardown(() => globalThis.clearTimeout(id));
    }

    const startSub = () => {
      if (!subscriber.active) {
        return;
      }
      subscriptionCount++;
      subscribeToSource(this, subscriber, {
        complete: () => {
          if (subscriptionCount >= count) {
            subscriber.complete();
          } else {
            if (delay == null) {
              startSub();
            } else {
              if (isTimeoutDelay) {
                id = globalThis.setTimeout(startSub, delay);
              } else {
                const innerController = new AbortController();
                const notifier = Observable.from(delay(++repeatCount));
                subscribeToSource(
                  notifier,
                  subscriber,
                  {
                    next: () => {
                      innerController.abort();
                      startSub();
                    },
                    complete: () => subscriber.complete(),
                  },
                  innerController.signal
                );
              }
            }
          }
        },
      });
    };

    startSub();
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `repeat` form of the exact-Symbol `[repeat]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[repeat]` to its source.
 */
export function pipeableRepeat<T>(config?: { count?: number; delay?: number | ((repeatCount: number) => ObservableInput<any>) }): (source: Observable<T>) => Observable<T>;
export function pipeableRepeat(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[repeat] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
