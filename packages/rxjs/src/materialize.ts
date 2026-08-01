import { create } from './create.js';
import { Notification, type ObservableNotification } from './notification.js';
import { subscribeToSource } from './util/observable-helpers.js';

export const materialize: unique symbol = Symbol('materialize');

declare global {
  interface Observable<T> {
    [materialize](): Observable<Notification<T> & ObservableNotification<T>>;
  }
}

Observable.prototype[materialize] = function <T>(this: Observable<T>): Observable<Notification<T> & ObservableNotification<T>> {
  return this[create]((subscriber) => {
    subscribeToSource(this, subscriber, {
      next: (value) => subscriber.next(Notification.createNext(value)),
      error: (error) => {
        subscriber.next(Notification.createError<T>(error));
        subscriber.complete();
      },
      complete: () => {
        subscriber.next(Notification.createComplete<T>());
        subscriber.complete();
      },
    });
  });
};
