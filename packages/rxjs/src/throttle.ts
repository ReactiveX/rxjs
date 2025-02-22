// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const throttle: unique symbol = Symbol('throttle');

declare global {
  interface Observable<T> {
    [throttle]: (
      delay: number | ((value: T, index: number) => ObservableValue<any>),
      config?: ThrottleConfig
    ) => Observable<T>;
  }
}

interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
}

Observable.prototype[throttle] = function <T>(
  this: Observable<T>,
  delay: number | ((value: T, index: number) => ObservableValue<any>),
  config?: ThrottleConfig
): Observable<T> {
  return this[create]((subscriber) => {
    const { leading = true, trailing = false } = config ?? {};
    let innerController: AbortController | null = null;
    let index = 0;
    let complete = false;
    let hasValue = false;
    let sendValue: T | null = null;

    const sendError = (error: any) => subscriber.error(error);

    const endThrottling = () => {
      innerController?.abort();
      innerController = null;

      if (trailing) {
        send();
        if (complete) {
          subscriber.complete();
        }
      }
    };

    const cleanupThrottling = () => {
      innerController = null;
      if (complete) {
        subscriber.complete();
      }
    };

    const startThrottle = (value: T) => {
      innerController = new AbortController();
      const signal = AbortSignal.any([
        subscriber.signal,
        innerController.signal,
      ]);

      if (typeof delay === 'number') {
        const id = setTimeout(endThrottling, delay);

        signal.addEventListener('abort', () => clearTimeout(id), {
          once: true,
        });
      } else {
        let result: Observable<any>;
        try {
          result = Observable.from(delay(value, index++));
        } catch (error) {
          subscriber.error(error);
          return;
        }
        result.subscribe(
          {
            next: endThrottling,
            complete: cleanupThrottling,
            error: sendError,
          },
          { signal }
        );
      }
    };

    const send = () => {
      if (hasValue) {
        hasValue = false;
        const value = sendValue!;
        sendValue = null;
        subscriber.next(value);
        if (!complete) {
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
            }
          }
        },
        error: sendError,
        complete: () => {
          complete = true;
        },
      },
      { signal: subscriber.signal }
    );
  });
};
