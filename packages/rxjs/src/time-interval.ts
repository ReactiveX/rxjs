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

const dateTimestampProvider: TimeIntervalProvider = {
  now: () => Date.now(),
};

Observable.prototype[timeInterval] = function <T>(
  this: Observable<T>,
  timestampProvider: TimeIntervalProvider = dateTimestampProvider
): Observable<TimeInterval<T>> {
  return this[create]((subscriber) => {
    let lastTimestamp: number;
    try {
      lastTimestamp = timestampProvider.now();
    } catch (error) {
      subscriber.error(error);
      return;
    }

    this.subscribe(
      {
        next: (value) => {
          let currentTimestamp: number;
          try {
            currentTimestamp = timestampProvider.now();
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
};
