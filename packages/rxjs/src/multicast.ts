import { connect } from './connect.js';
import { ConnectableObservable } from './connectable.js';
import type { ObservedValueOf, SubjectLike } from './util/types.js';

export const multicast: unique symbol = Symbol('multicast');

declare global {
  interface Observable<T> {
    [multicast](subject: SubjectLike<T>): ConnectableObservable<T>;
    [multicast](subjectFactory: () => SubjectLike<T>): ConnectableObservable<T>;
    [multicast]<Selected extends ObservableValue<unknown>>(
      subject: SubjectLike<T>,
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
    [multicast]<Selected extends ObservableValue<unknown>>(
      subjectFactory: () => SubjectLike<T>,
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
  }
}

Observable.prototype[multicast] = function <T, Selected extends ObservableValue<unknown>>(
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
