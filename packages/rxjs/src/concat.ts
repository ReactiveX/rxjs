import { merge } from './merge';
import { isObservableInstance } from './util/ctor-helpers.js';
import { ObservableArrayToValueUnion } from './util/types';

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
  const actualSources: ObservableValue<any>[] = isObservableInstance(this) ? [this, ...sources] : [...sources];

  return this[merge](actualSources, { concurrency: 1 });
}
