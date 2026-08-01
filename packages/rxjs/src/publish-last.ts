import { AsyncSubject } from './async-subject.js';
import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';

export const publishLast: unique symbol = Symbol('publishLast');

declare global {
  interface Observable<T> {
    [publishLast](): ConnectableObservable<T>;
  }
}

Observable.prototype[publishLast] = function <T>(this: Observable<T>): ConnectableObservable<T> {
  // RxJS 7 retains one AsyncSubject for the lifetime of the manually
  // connectable result, including after completion or error.
  return this[multicast](new AsyncSubject<T>());
};
