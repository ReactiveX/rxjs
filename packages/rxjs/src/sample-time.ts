import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const sampleTime: unique symbol = Symbol('sampleTime');

declare global {
  interface Observable<T> {
    [sampleTime]: (period: number) => Observable<T>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, period: number): Observable<T> {
    return this[create]((subscriber) => {
      let hasValue = false;
      let latestValue: T;

      this.subscribe(
        {
          next: (value) => {
            hasValue = true;
            latestValue = value;
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );

      if (!subscriber.active) {
        return;
      }

      const id = globalThis.setInterval(() => {
        if (hasValue) {
          hasValue = false;
          subscriber.next(latestValue);
        }
      }, period);
      subscriber.addTeardown(() => globalThis.clearInterval(id));
    });
  },
  name: 'sampleTime',
  symbol: sampleTime,
});
