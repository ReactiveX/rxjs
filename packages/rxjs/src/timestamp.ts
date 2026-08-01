import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

Observable.prototype[timestamp] = function <T>(this: Observable<T>, timestampProvider?: TimestampProvider): Observable<Timestamp<T>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
        subscriber.next({ value, timestamp: currentTimestamp });
      },
    });
  });
};
