import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';

export const timestamp: unique symbol = Symbol('timestamp');

export interface TimestampProvider {
  now(): number;
}

export interface Timestamp<T> {
  value: T;
  timestamp: number;
}

declare global {
  interface Observable<T> {
    [timestamp]: (timestampProvider?: TimestampProvider) => Observable<Timestamp<T>>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, timestampProvider?: TimestampProvider): Observable<Timestamp<T>> {
    return this[create]((subscriber) => {
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
            subscriber.next({ value, timestamp: currentTimestamp });
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'timestamp',
  symbol: timestamp,
});
