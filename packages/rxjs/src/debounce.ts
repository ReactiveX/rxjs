import { create } from './create.js';

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

    this.subscribe(
      {
        next: (value) => {
          hasValue = true;
          lastValue = value;

          innerController?.abort();
          innerController = new AbortController();
          const signal = AbortSignal.any([subscriber.signal, innerController.signal]);

          if (typeof delay === 'number') {
            const id = setTimeout(emitPendingValue, delay);
            innerController.signal.addEventListener(
              'abort',
              () => {
                clearTimeout(id);
              },
              { once: true }
            );
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
                next: emitPendingValue,
                error: (error) => subscriber.error(error),
              },
              { signal }
            );
          }
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          emitPendingValue();
          subscriber.complete();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
