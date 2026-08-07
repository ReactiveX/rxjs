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

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Calls the static exact-Symbol `Observable[timer]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticTimer(delay: number): Observable<number>;
export function staticTimer(delay: number, interval: number): Observable<number>;
export function staticTimer(...args: any[]): any {
  return Reflect.apply(Observable[timer] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
