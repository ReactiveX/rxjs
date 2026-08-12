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

    const emitPendingValue = () => {
      if (!hasValue) {
        return;
      }
      hasValue = false;
      innerController?.abort();
      innerController = null;
      subscriber.next(lastValue);
    };

    subscriber.addTeardown(() => innerController?.abort());

    subscribeToSource(this, subscriber, {
      next: (value) => {
        hasValue = true;
        lastValue = value;

        innerController?.abort();
        innerController = new AbortController();

        if (typeof delay === 'number') {
          const id = globalThis.setTimeout(emitPendingValue, delay);
          innerController.signal.addEventListener(
            'abort',
            () => {
              globalThis.clearTimeout(id);
            },
            { once: true }
          );
        } else {
          const result = Observable.from(delay(value, index++));
          subscribeToSource(result, subscriber, { next: emitPendingValue, complete: () => void 0 }, innerController.signal);
        }
      },
      complete: () => {
        emitPendingValue();
        subscriber.complete();
      },
    });
  });
};
