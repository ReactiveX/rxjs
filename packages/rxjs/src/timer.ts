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

function timerFactory(this: ObservableCtor, delay: number, interval?: number): Observable<number> {
  return this[create]((subscriber) => {
    let n = 0;

    let id = globalThis.setInterval(() => {
      subscriber.next(n++);

      if (interval == null || interval < 0) {
        subscriber.complete();
      } else if (interval !== delay) {
        globalThis.clearInterval(id);
        id = globalThis.setInterval(() => {
          subscriber.next(n++);
        });
      }
    }, delay);

    subscriber.addTeardown(() => globalThis.clearInterval(id));
  });
}

Observable[timer] = timerFactory;
