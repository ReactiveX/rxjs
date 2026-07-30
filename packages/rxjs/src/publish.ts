import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';
import { Subject } from './subject.js';
import type { ObservedValueOf } from './util/types.js';

export const publish: unique symbol = Symbol('publish');

declare global {
  interface Observable<T> {
    [publish](): ConnectableObservable<T>;
    [publish]<Selected extends ObservableValue<unknown>>(
      selector: (shared: Observable<T>) => Selected
    ): Observable<ObservedValueOf<Selected>>;
  }
}

Observable.prototype[publish] = function <T, Selected extends ObservableValue<unknown>>(
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
