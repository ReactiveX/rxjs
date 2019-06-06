import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

/**
 * Shares a single observable to many subscribers via a single, underlying {@link Subject}
 *
 * Publishing a source will return a {@link ConnectableObservable}, which is an observable
 * that pairs the `source` to an single, underlying {@link Subject}. When a consumer
 * subscribes to the returned observable, they are actually subscribing to the subject, and the
 * {@link Subscription} returned is the subscription from that action.
 * When `connect` is called on the returned observable, the `source` is subscribed to
 * with that subject, connecting the source to all subscribed observers through the subject,
 * and thus "multicasting".
 *
 * ## Example
 *
 * ```ts
 * import { of, publish } from 'rxjs';
 * const source = of(1, 2, 3);
 *
 * const shared = publish(source);
 *
 * shared.subscribe({
 *  next: v => console.log('sub1: ', v),
 *  complete: () => console.log('sub1: done'),
 * });
 *
 * shared.subscribe({
 *  next: v => console.log('sub2: ', v),
 *  complete: () => console.log('sub2: done'),
 * });
 *
 * shared.connect();
 *
 * // Output
 * // sub1: 1
 * // sub2: 1
 * // sub1: 2
 * // sub2: 2
 * // sub1: 3
 * // sub2: 4
 * // sub1: done
 * // sub2: done
 * ```
 *
 * @param source The observable to multicast
 */
export function publish<T>(source: Observable<T>): ConnectableObservable<T> {
  return multicast(source, new Subject<T>());
}
