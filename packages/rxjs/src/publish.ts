import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';
import { Subject } from './subject.js';
import type { ObservedValueOf } from './util/types.js';

export const publish: unique symbol = Symbol('publish');

declare global {
  interface Observable<T> {
    [publish](): ConnectableObservable<T>;
    [publish]<Selected extends ObservableInput<unknown>>(
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
  }
}

Observable.prototype[publish] = function <T, Selected extends ObservableInput<unknown>>(
  this: Observable<T>,
  selector?: (shared: Observable<T>) => Selected
): ConnectableObservable<T> | Observable<ObservedValueOf<Selected>> {
  if (selector) {
    return this[multicast](() => new Subject<T>(), selector);
  }

  // RxJS 7 publish() retains one Subject instance for the lifetime of this
  // manually connectable result.
  return this[multicast](new Subject<T>());
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `publish` form of the exact-Symbol `[publish]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. Any non-Observable result is returned unchanged.
 *
 * @returns A unary function that applies `[publish]` to its source.
 */
export function pipeablePublish<T>(): (source: Observable<T>) => ConnectableObservable<T>;
export function pipeablePublish(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[publish] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
