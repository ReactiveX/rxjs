import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';
import { Notification, type ObservableNotification } from './notification.js';

export const materialize: unique symbol = Symbol('materialize');

declare global {
  interface Observable<T> {
    [materialize](): Observable<Notification<T> & ObservableNotification<T>>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>): Observable<Notification<T> & ObservableNotification<T>> {
    return this[create]((subscriber) => {
      this.subscribe(
        {
          next: (value) => subscriber.next(Notification.createNext(value)),
          error: (error) => {
            subscriber.next(Notification.createError<T>(error));
            subscriber.complete();
          },
          complete: () => {
            subscriber.next(Notification.createComplete<T>());
            subscriber.complete();
          },
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'materialize',
  symbol: materialize,
});
