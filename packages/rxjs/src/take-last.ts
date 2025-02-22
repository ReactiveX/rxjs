// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const takeLast: unique symbol = Symbol('takeLast');

declare global {
  interface Observable<T> {
    takeLast: (amount?: number) => Observable<T>;
  }
}

Observable.prototype[takeLast] = function <T>(
  this: Observable<T>,
  amount = 1
): Observable<T> {
  return this[create]((subscriber) => {
    let ring = new Array<T>(amount);
    let counter = 0;
    subscriber.addTeardown(() => {
      ring = null!;
    });
    this.subscribe(
      {
        next: (value) => {
          ring[counter++ % amount] = value;
        },
        error: (error) => subscriber.error(error),
        complete: () => {
          const start = amount <= counter ? counter : 0;
          const total = Math.min(amount, counter);
          for (let i = 0; i < total; i++) {
            subscriber.next(ring[(start + i) % amount]);
          }
          subscriber.complete();
        },
      },
      { signal: subscriber.signal }
    );
  });
};
