import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const throttle: unique symbol = Symbol('throttle');

declare global {
  interface Observable<T> {
    [throttle]: (delay: number | ((value: T, index: number) => ObservableValue<unknown>), config?: ThrottleConfig) => Observable<T>;
  }
}

interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
  restartOnTrailing?: boolean;
}

installObservableExtension({
  instance: function <T>(
    this: Observable<T>,
    delay: number | ((value: T, index: number) => ObservableValue<unknown>),
    config?: ThrottleConfig
  ): Observable<T> {
    return this[create]((subscriber) => {
      const { leading = true, trailing = false, restartOnTrailing = true } = config ?? {};
      let innerController: AbortController | null = null;
      let index = 0;
      let sourceComplete = false;
      let hasValue = false;
      let sendValue: T | undefined;

      const sendError = (error: unknown) => subscriber.error(error);

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
          let result: Observable<unknown>;
          try {
            result = Observable.from(delay(value, index++));
          } catch (error) {
            if (innerController === controller) {
              innerController = null;
            }
            subscriber.error(error);
            return;
          }
          result.subscribe(
            {
              next: () => endThrottling(controller),
              complete: () => cleanupThrottling(controller),
              error: sendError,
            },
            { signal }
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

      this.subscribe(
        {
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
          error: sendError,
          complete: () => {
            sourceComplete = true;
            if (!(trailing && hasValue && innerController)) {
              subscriber.complete();
            }
          },
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'throttle',
  symbol: throttle,
});
