// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
import '../observable-polyfill';
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
    const id = setInterval(() => {
      subscriber.next(n++);
    }, ms);
    subscriber.addTeardown(() => clearInterval(id));
  });
}
