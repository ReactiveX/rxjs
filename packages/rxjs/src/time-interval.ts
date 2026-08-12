import { create } from './create.js';
import { subscribeToSource } from './util/observable-helpers.js';

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

Observable.prototype[timeInterval] = function <T>(
  this: Observable<T>,
  timestampProvider?: TimeIntervalProvider
): Observable<TimeInterval<T>> {
  return this[create]((subscriber) => {
    let lastTimestamp: number;
    try {
      lastTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    subscribeToSource(this, subscriber, {
      next: (value) => {
        const currentTimestamp = timestampProvider === undefined ? globalThis.Date.now() : timestampProvider.now();
        const interval = currentTimestamp - lastTimestamp;
        lastTimestamp = currentTimestamp;
        subscriber.next(new TimeInterval(value, interval));
      },
    });
  });
};
