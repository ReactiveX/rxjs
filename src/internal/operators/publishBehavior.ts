import { Observable } from '../Observable';
import { BehaviorSubject } from '../BehaviorSubject';
import { multicast } from './multicast';
import { OperatorFunction } from '../types';

/**
 * Multicasts the observable source through an underlying {@link BehaviorSubject}. All subscriptions
 * to the resulting observable will subscribe to the underlaying `BehaviorSubject`, the
 * resulting observable is a {@link ConnectableObservable}. If you call `connect()` on that observable
 * (requires a cast to `ConnectableObservable` in TypeScript), it will subscribe to the source
 * observable with the underlying subject and connect that source too all consumers subscribed through the
 * subject. Because it's using a `BehaviorSubject`, all new subscriptions will get the most recent value
 * that has passed through said subject, _or_ they will get the `initialValue` if no values have
 * arrived yet, so long as the published `ConnectableObservable` has been connected.
 *
 * @param initialValue
 * @return {ConnectableObservable<T>}
 */
export function publishBehavior<T, D>(initialValue: D): OperatorFunction<T, T | D> {
  return (source: Observable<T>) => multicast(new BehaviorSubject<T | D>(initialValue))(source);
}
