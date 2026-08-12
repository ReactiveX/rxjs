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
