import { create } from './create.js';

export const delayWhen: unique symbol = Symbol('delayWhen');

declare global {
  interface Observable<T> {
    [delayWhen](durationSelector: (value: T, index: number) => ObservableValue<any>, subscriptionDelay?: Observable<any>): Observable<T>;
  }
}

interface DelayContext<T> {
  readonly value: T;
  readonly controller: AbortController;
}

Observable.prototype[delayWhen] = function <T>(
  this: Observable<T>,
  durationSelector: (value: T, index: number) => ObservableValue<any>,
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
      const currentIndex = index++;
      let durationInput: ObservableValue<any>;

      try {
        durationInput = durationSelector(value, currentIndex);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      let duration: Observable<any>;
      try {
        duration = Observable.from(durationInput);
      } catch (error) {
        subscriber.error(error);
        return;
      }

      if (!subscriber.active) {
        return;
      }

      const context: DelayContext<T> = {
        value,
        controller: new AbortController(),
      };
      delays.add(context);

      try {
        duration.subscribe(
          {
            next: () => settleDelay(context, true),
            error: (error) => subscriber.error(error),
            // Pinned RxJS 7 behavior: completion without a value releases
            // this duration but swallows its associated source value.
            complete: () => settleDelay(context, false),
          },
          { signal: AbortSignal.any([subscriber.signal, context.controller.signal]) }
        );
      } catch (error) {
        if (delays.delete(context)) {
          context.controller.abort();
          subscriber.error(error);
        }
      }
    };

    const startSource = (): void => {
      if (sourceStarted || !subscriber.active) {
        return;
      }

      sourceStarted = true;
      subscriptionDelayController.abort();

      try {
        source.subscribe(
          {
            next: (value) => {
              if (subscriber.active) {
                delayValue(value);
              }
            },
            error: (error) => subscriber.error(error),
            complete: () => {
              sourceComplete = true;
              completeIfDone();
            },
          },
          { signal: sourceController.signal }
        );
      } catch (error) {
        subscriber.error(error);
      }
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

    try {
      subscriptionDelaySource.subscribe(
        {
          next: startSource,
          error: (error) => subscriber.error(error),
          complete: startSource,
        },
        { signal: subscriptionDelayController.signal }
      );
    } catch (error) {
      subscriber.error(error);
    }
  });
};
