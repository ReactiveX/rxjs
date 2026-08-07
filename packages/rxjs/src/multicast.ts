import { connect } from './connect.js';
import { ConnectableObservable } from './connectable.js';
import type { ObservedValueOf, SubjectLike } from './util/types.js';

export const multicast: unique symbol = Symbol('multicast');

declare global {
  interface Observable<T> {
    [multicast](subject: SubjectLike<T>): ConnectableObservable<T>;
    [multicast](subjectFactory: () => SubjectLike<T>): ConnectableObservable<T>;
    [multicast]<Selected extends ObservableInput<unknown>>(
      subject: SubjectLike<T>,
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
    [multicast]<Selected extends ObservableInput<unknown>>(
      subjectFactory: () => SubjectLike<T>,
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
  }
}

Observable.prototype[multicast] = function <T, Selected extends ObservableInput<unknown>>(
  this: Observable<T>,
  subjectOrFactory: SubjectLike<T> | (() => SubjectLike<T>),
  selector?: (shared: Observable<T>) => Selected
): ConnectableObservable<T> | Observable<ObservedValueOf<Selected>> {
  const subjectFactory = typeof subjectOrFactory === 'function' ? subjectOrFactory : () => subjectOrFactory;

  if (selector) {
    return this[connect](selector, { connector: subjectFactory });
  }

  return new ConnectableObservable(this, subjectFactory);
};

// BEGIN GENERATED FUNCTIONAL SURFACE

/**
 * Creates the pipeable `multicast` form of the exact-Symbol `[multicast]` capability.
 *
 * The source is supplied when the returned unary function is composed with
 * `rx`, `pipe`, or another function-composition helper. Any non-Observable result is returned unchanged.
 *
 * @returns A unary function that applies `[multicast]` to its source.
 */
export function pipeableMulticast<T>(subject: SubjectLike<T>): (source: Observable<T>) => ConnectableObservable<T>;
export function pipeableMulticast(...args: any[]): any {
  return (source: Observable<any>) => Reflect.apply(source[multicast] as (...values: any[]) => any, source, args);
}

// END GENERATED FUNCTIONAL SURFACE
