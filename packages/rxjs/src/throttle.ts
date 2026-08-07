import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const throttle: unique symbol = Symbol('throttle');

declare global {
  interface Observable<T> {
    [throttle]: (delay: number | ((value: T, index: number) => ObservableInput<unknown>), config?: ThrottleConfig) => Observable<T>;
  }
}

interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
  restartOnTrailing?: boolean;
}

Observable.prototype[throttle] = function <T>(
  this: Observable<T>,
  delay: number | ((value: T, index: number) => ObservableInput<unknown>),
  config?: ThrottleConfig
): Observable<T> {
  return this[create]((subscriber) => {
    const { leading = true, trailing = false, restartOnTrailing = true } = config ?? {};
    let innerController: AbortController | null = null;
    let index = 0;
    let sourceComplete = false;
    let hasValue = false;
    let sendValue: T | undefined;

    const endThrottling = (controller: AbortController) => {
      if (innerController !== controller) {
        return;
      }
      controller.abort();
      innerController = null;

      if (trailing) {
        send(restartOnTrailing);
      }
      if (sourceComplete) {
        subscriber.complete();
      }
    };

    const cleanupThrottling = (controller: AbortController) => {
      if (innerController !== controller) {
        return;
      }
      innerController = null;
      if (sourceComplete) {
        subscriber.complete();
      }
    };

    const startThrottle = (value: T) => {
      const controller = new AbortController();
      innerController = controller;
      const signal = AbortSignal.any([subscriber.signal, controller.signal]);

      if (typeof delay === 'number') {
        const id = globalThis.setTimeout(() => endThrottling(controller), delay);

        signal.addEventListener('abort', () => globalThis.clearTimeout(id), {
          once: true,
        });
      } else {
        const result = Observable.from(delay(value, index++));
        subscribeToSource(
          result,
          subscriber,
          {
            next: () => endThrottling(controller),
            complete: () => cleanupThrottling(controller),
          },
          controller.signal
        );
      }
    };

    const send = (restartThrottle = true) => {
      if (hasValue) {
        hasValue = false;
        const value = sendValue as T;
        sendValue = undefined;
        subscriber.next(value);
        if (restartThrottle && !sourceComplete && subscriber.active) {
          startThrottle(value);
        }
      }
    };

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        sendValue = value;
        if (!innerController) {
          if (leading) {
            send();
          } else {
            startThrottle(value);
          }
        }
      },
      complete: () => {
        sourceComplete = true;
        if (!(trailing && hasValue && innerController)) {
          subscriber.complete();
        }
      },
    });
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `throttle` form of the exact-Symbol `[throttle]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[throttle]` to its source.
 */
export function pipeableThrottle<T>(delay: number | ((value: T, index: number) => ObservableInput<unknown>), config?: ThrottleConfig): (source: Observable<T>) => Observable<T>;
export function pipeableThrottle(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[throttle] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
