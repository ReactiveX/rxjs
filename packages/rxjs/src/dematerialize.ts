import { installObservableExtension } from './util/install-observable-extension.js';
import { create } from './create.js';
import { observeNotification, type ObservableNotification, type ValueFromNotification } from './notification.js';

export const dematerialize: unique symbol = Symbol('dematerialize');

declare global {
  interface Observable<T> {
    [dematerialize](): Observable<ValueFromNotification<T>>;
  }
}

installObservableExtension({
  instance: function <N extends ObservableNotification<any>>(this: Observable<N>): Observable<ValueFromNotification<N>> {
    return this[create]((subscriber) => {
      this.subscribe(
        {
          next: (notification) => {
            try {
              observeNotification(notification, subscriber);
            } catch (error) {
              subscriber.error(error);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  },
  name: 'dematerialize',
  symbol: dematerialize,
});
