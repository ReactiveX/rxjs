import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const debounce: unique symbol = Symbol('debounce');

declare global {
  interface Observable<T> {
    [debounce]: (delay: number | ((value: T, index: number) => ObservableInput<any>)) => Observable<T>;
  }
}

Observable.prototype[debounce] = function <T>(
  this: Observable<T>,
  delay: number | ((value: T, index: number) => ObservableInput<any>)
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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `debounce` form of the exact-Symbol `[debounce]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. The result uses the same construction, error-forwarding, and AbortSignal cancellation behavior as the Symbol form.
 *
 * @returns A unary function that applies `[debounce]` to its source.
 */
export function pipeableDebounce<T>(delay: number | ((value: T, index: number) => ObservableInput<any>)): (source: Observable<T>) => Observable<T>;
export function pipeableDebounce(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[debounce] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
