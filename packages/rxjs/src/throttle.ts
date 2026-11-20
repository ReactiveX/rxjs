import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const throttle: unique symbol = Symbol('throttle');

declare const auditConfigBrand: unique symbol;
declare const futureDurationSignalBrand: unique symbol;

/**
 * A duration Observable whose activation cannot notify in the selector's
 * current synchronous call stack.
 *
 * Create this value with {@link futureDuration}. The private brand makes the
 * temporal guarantee explicit instead of trying to infer it from an
 * Observable's structural type.
 */
export interface FutureDurationSignal extends Observable<any> {
  readonly [futureDurationSignalBrand]: true;
}

/** The strict audit-mode configuration for {@link throttle}. */
export interface AuditThrottleConfig {
  readonly leading: false;
  readonly trailing: true;
  readonly restartOnTrailing: false;
  readonly [auditConfigBrand]: true;
}

/** Configuration for ordinary throttle behavior. */
export interface ThrottleConfig {
  leading?: boolean;
  trailing?: boolean;
  restartOnTrailing?: boolean;
  readonly [auditConfigBrand]?: never;
}

/**
 * Selects audit behavior and requires selector-created durations to be
 * {@link FutureDurationSignal}s.
 */
export const auditConfig: AuditThrottleConfig = Object.freeze({
  leading: false,
  trailing: true,
  restartOnTrailing: false,
}) as AuditThrottleConfig;

/**
 * Creates a duration signal that cannot notify before the caller's current
 * synchronous call stack unwinds.
 *
 * Numeric inputs use a host timeout. Observable inputs are activated in a
 * microtask, so even a synchronous Observable or Iterable becomes an explicit
 * future duration. Cancellation before that activation prevents the input
 * from being subscribed.
 */
export function futureDuration(delay: number): FutureDurationSignal;
export function futureDuration<T>(input: ObservableValue<T>): FutureDurationSignal;
export function futureDuration(input: number | ObservableValue<any>): FutureDurationSignal {
  return Observable[create]<any>((subscriber) => {
    if (typeof input === 'number') {
      const id = globalThis.setTimeout(() => {
        subscriber.next(undefined);
        subscriber.complete();
      }, input);
      subscriber.addTeardown(() => globalThis.clearTimeout(id));
      return;
    }

    globalThis.queueMicrotask(() => {
      if (!subscriber.active) {
        return;
      }

      let source: Observable<any>;
      try {
        source = Observable.from(input);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      subscribeToSource(source, subscriber);
    });
  }) as FutureDurationSignal;
}

declare global {
  interface Observable<T> {
    [throttle]: {
      (delay: number | ((value: T, index: number) => FutureDurationSignal), config: AuditThrottleConfig): Observable<T>;
      (delay: number | ((value: T, index: number) => ObservableValue<unknown>), config?: ThrottleConfig): Observable<T>;
    };
  }
}

Observable.prototype[throttle] = function <T>(
  this: Observable<T>,
  delay: number | ((value: T, index: number) => ObservableValue<unknown>),
  config?: ThrottleConfig | AuditThrottleConfig
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
