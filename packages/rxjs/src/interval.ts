import '@rxjs/observable-polyfill';
import { create } from './create.js';

export const interval: unique symbol = Symbol('interval');

declare global {
  interface ObservableCtor {
    [interval]: (ms: number) => Observable<number>;
  }
}

Observable[interval] = intervalImpl;

function intervalImpl(this: ObservableCtor, ms: number): Observable<number> {
  return this[create]((subscriber) => {
    let n = 0;
    const id = globalThis.setInterval(() => {
      subscriber.next(n++);
    }, ms);
    subscriber.addTeardown(() => globalThis.clearInterval(id));
  });
}

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Calls the static exact-Symbol `Observable[interval]` capability as an ordinary function.
 *
 * Construction, conversion, error forwarding, and cancellation remain owned
 * by the installed Symbol implementation.
 */
export function staticInterval(ms: number): Observable<number>;
export function staticInterval(...args: any[]): any {
  return Reflect.apply(Observable[interval] as (...values: any[]) => any, Observable, args);
}

// END GENERATED FUNCTIONAL SURFACE
