import { installObservableExtension } from './util/install-observable-extension.js';
import { behaviorSubject } from './behavior-subject.js';
import type { ConnectableObservable } from './connectable.js';
import { multicast } from './multicast.js';

export const publishBehavior: unique symbol = Symbol('publishBehavior');

declare global {
  interface Observable<T> {
    [publishBehavior](initialValue: T): ConnectableObservable<T>;
  }
}

installObservableExtension({
  instance: function <T>(this: Observable<T>, initialValue: T): ConnectableObservable<T> {
    // RxJS 7 creates one BehaviorSubject per published result and retains that
    // same instance across manual disconnects and terminal notifications.
    return this[multicast](behaviorSubject(initialValue));
  },
  name: 'publishBehavior',
  symbol: publishBehavior,
});
