import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const timeInterval: unique symbol = Symbol('timeInterval');

export interface TimeIntervalProvider {
  now(): number;
}

export class TimeInterval<T> {
  constructor(public value: T, public interval: number) {}
}

declare global {
  interface Observable<T> {
    [timeInterval]: (timestampProvider?: TimeIntervalProvider) => Observable<TimeInterval<T>>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, timestampProvider?: TimeIntervalProvider): Observable<TimeInterval<T>> {
    return this[create]((subscriber) => {
      let lastTimestamp: number;
      try {
        lastTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
      } catch (error) {
        subscriber.error(error);
        return;
      }

      this.subscribe(
        {
          next: (value) => {
            let currentTimestamp: number;
            try {
              currentTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
            } catch (error) {
              subscriber.error(error);
              return;
            }
            const interval = currentTimestamp - lastTimestamp;
            lastTimestamp = currentTimestamp;
            subscriber.next(new TimeInterval(value, interval));
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'timeInterval',
  symbol: timeInterval,
});
