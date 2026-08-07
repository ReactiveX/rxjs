import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const delayWhen: unique symbol = Symbol('delayWhen');

declare global {
  interface Observable<T> {
    [delayWhen](durationSelector: (value: T, index: number) => ObservableInput<any>, subscriptionDelay?: Observable<any>): Observable<T>;
  }
}

interface DelayContext<T> {
  readonly value: T;
  readonly controller: AbortController;
}

Observable.prototype[delayWhen] = function <T>(
  this: Observable<T>,
  durationSelector: (value: T, index: number) => ObservableInput<any>,
  subscriptionDelay?: Observable<any>
): Observable<T> {
  const source = this;

  return source[create]<T>((subscriber) => {
    const sourceController = new AbortController();
    const subscriptionDelayController = new AbortController();
    const delays = new Set<DelayContext<T>>();
    let index = 0;
    let sourceComplete = false;
    let sourceStarted = false;

    const releaseInputs = (): void => {
      sourceController.abort(subscriber.signal.reason);
      subscriptionDelayController.abort(subscriber.signal.reason);
      for (const context of delays) {
        context.controller.abort(subscriber.signal.reason);
      }
      delays.clear();
    };

    const completeIfDone = (): void => {
      if (sourceComplete && delays.size === 0 && subscriber.active) {
        subscriber.complete();
      }
    };

    const settleDelay = (context: DelayContext<T>, emit: boolean): void => {
      if (!delays.delete(context)) {
        return;
      }

      context.controller.abort();
      if (emit && subscriber.active) {
        subscriber.next(context.value);
      }
      completeIfDone();
    };

    const delayValue = (value: T): void => {
      const duration = Observable.from(durationSelector(value, index++));

      if (!subscriber.active) {
        return;
      }

      const context: DelayContext<T> = {
        value,
        controller: new AbortController(),
      };
      delays.add(context);

      subscribeToSource(
        duration,
        subscriber,
        {
          next: () => settleDelay(context, true),
          // Pinned RxJS 7 behavior: completion without a value releases
          // this duration but swallows its associated source value.
          complete: () => settleDelay(context, false),
        },
        context.controller.signal
      );
    };

    const startSource = (): void => {
      if (sourceStarted || !subscriber.active) {
        return;
      }

      sourceStarted = true;
      subscriptionDelayController.abort();

      subscribeToSource(
        source,
        subscriber,
        {
          next: (value) => {
            if (subscriber.active) {
              delayValue(value);
            }
          },
          complete: () => {
            sourceComplete = true;
            completeIfDone();
          },
        },
        sourceController.signal
      );
    };

    subscriber.addTeardown(releaseInputs);

    if (subscriptionDelay === undefined) {
      startSource();
      return;
    }

    let subscriptionDelaySource: Observable<any>;
    try {
      subscriptionDelaySource = Observable.from(subscriptionDelay);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(
      subscriptionDelaySource,
      subscriber,
      { next: startSource, complete: startSource },
      subscriptionDelayController.signal
    );
  });
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `delayWhen` form of the exact-Symbol `[delayWhen]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[delayWhen]` to its source.
 */
export function pipeableDelayWhen<T>(durationSelector: (value: T, index: number) => ObservableInput<any>, subscriptionDelay?: Observable<any>): (source: Observable<T>) => Observable<T>;
export function pipeableDelayWhen(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[delayWhen] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
