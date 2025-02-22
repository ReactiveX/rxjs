// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import { create } from './create.js';

export const timer: unique symbol = Symbol('timer');

declare global {
  interface ObservableCtor {
    [timer]: {
      (delay: number): Observable<number>;
      (delay: number, interval: number): Observable<number>;
    };
  }
}

Observable[timer] = function timerImpl(
  this: ObservableCtor,
  delay: number,
  interval?: number
): Observable<number> {
  return this[create]((subscriber) => {
    let n = 0;

    let id = setInterval(() => {
      subscriber.next(n++);

      if (interval == null || interval < 0) {
        subscriber.complete();
      } else if (interval !== delay) {
        clearInterval(id);
        id = setInterval(() => {
          subscriber.next(n++);
        });
      }
    }, delay);

    subscriber.addTeardown(() => clearInterval(id));
  });
};
