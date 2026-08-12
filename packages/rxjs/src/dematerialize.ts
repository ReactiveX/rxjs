import { create } from './create.js';
import { observeNotification, type ObservableNotification, type ValueFromNotification } from './notification.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const dematerialize: unique symbol = Symbol('dematerialize');

declare global {
  interface Observable<T> {
    [dematerialize](): Observable<ValueFromNotification<T>>;
  }
}

Observable.prototype[dematerialize] = function <N extends ObservableNotification<any>>(
  this: Observable<N>
): Observable<ValueFromNotification<N>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, { next: (notification) => observeNotification(notification, subscriber) });
  });
};
