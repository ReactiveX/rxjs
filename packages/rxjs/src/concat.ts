import { merge } from './merge.js';
import type { ObservableArrayToValueUnion } from './util/types.js';

export const concat: unique symbol = Symbol('concat');

declare global {
  interface ObservableCtor {
    [concat]: <Sources extends readonly ObservableValue<any>[]>(otherSources: Sources) => Observable<ObservableArrayToValueUnion<Sources>>;
  }

  interface Observable<T> {
    [concat]: <Sources extends readonly ObservableValue<any>[]>(
      otherSources: Sources
    ) => Observable<T | ObservableArrayToValueUnion<Sources>>;
  }
}

Observable[concat] = concatImpl;
Observable.prototype[concat] = concatImpl;

function concatImpl<Sources extends readonly ObservableValue<any>[]>(
  this: ObservableCtor | Observable<any>,
  sources: Sources
): Observable<ObservableArrayToValueUnion<Sources>> {
  return this[merge](sources, { concurrency: 1 });
}
