import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const debounce: unique symbol = Symbol('debounce');

declare global {
  interface Observable<T> {
    [debounce]: (delay: number | ((value: T, index: number) => ObservableValue<any>)) => Observable<T>;
  }
}

Observable.prototype[debounce] = function <T>(
  this: Observable<T>,
  delay: number | ((value: T, index: number) => ObservableValue<any>)
): Observable<T> {
  return this[create]((subscriber) => {
    let innerController: AbortController | null = null;
    let hasValue = false;
    let lastValue: T;
    let index = 0;
    let sourceComplete = false;
    let pendingEmissions = 0;

    const completeIfReady = () => {
      if (sourceComplete && pendingEmissions === 0) {
        subscriber.complete();
      }
    };

    const emitPendingValue = () => {
      if (!hasValue) {
        return;
      }
      const value = lastValue;
      const controller = innerController;
      hasValue = false;
      innerController = null;
      // Duration teardown can synchronously notify or complete the source.
      pendingEmissions++;
      try {
        controller?.abort();
      } finally {
        pendingEmissions--;
      }
      subscriber.next(value);
      completeIfReady();
    };

    subscriber.addTeardown(() => innerController?.abort());

    subscribeToSource(this, subscriber, {
      next: (value) => {
        if (!subscriber.active) {
          return;
        }
        const previousController = innerController;
        const controller = new AbortController();
        innerController = controller;
        hasValue = true;
        lastValue = value;

        previousController?.abort();
        if (innerController !== controller || !subscriber.active) {
          return;
        }

        if (typeof delay === 'number') {
          const id = globalThis.setTimeout(emitPendingValue, delay);
          controller.signal.addEventListener(
            'abort',
            () => {
              globalThis.clearTimeout(id);
            },
            { once: true }
          );
        } else {
          let result: Observable<unknown>;
          try {
            const duration = delay(value, index++);
            if (innerController !== controller || !subscriber.active) {
              return;
            }
            result = Observable.from(duration);
          } catch (error) {
            if (innerController === controller && subscriber.active) {
              subscriber.error(error);
            }
            return;
          }
          if (innerController !== controller || !subscriber.active) {
            return;
          }
          subscribeToSource(
            result,
            subscriber,
            {
              next: () => {
                if (innerController === controller && subscriber.active) {
                  emitPendingValue();
                }
              },
              error: (error) => {
                if (innerController === controller && subscriber.active) {
                  subscriber.error(error);
                }
              },
              complete: () => void 0,
            },
            controller.signal
          );
        }
      },
      complete: () => {
        sourceComplete = true;
        emitPendingValue();
        completeIfReady();
      },
    });
  });
};
