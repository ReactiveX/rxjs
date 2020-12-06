/** @prettier */
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { MonoTypeOperatorFunction, OperatorFunction, UnaryFunction, ObservableInput, ObservedValueOf } from '../types';
import { connect } from './connect';

/**
 * Returns a connectable observable that, when connected, will multicast
 * all values through a single underlying {@link Subject} instance.
 *
 * @deprecated To be removed in version 8. If you're using `publish()` to get a connectable observable,
 * please use the new {@link connectable} creation function. `source.pipe(publish())` is
 * equivalent to `connectable(source, () => new Subject())`. If you're calling {@link refCount} on the result
 * of `publish`, please use the updated {@link share} operator which is highly configurable.
 * `source.pipe(publish(), refCount())` is equivalent to
 * `source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
 */
export function publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Returns an observable, that when subscribed to, creates an underlying {@link Subject},
 * provides an observable view of it to a `selector` function, takes the observable result of
 * that selector function and subscribes to it, sending its values to the consumer, _then_ connects
 * the subject to the original source.
 *
 * @param selector A function used to setup multicasting prior to automatic connection.
 *
 * @deprecated To be removed in version 8. Use the new {@link connect} operator.
 * If you're using `publish(fn)`, it is equivalent to `connect(fn)`.
 */
export function publish<T, O extends ObservableInput<any>>(selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
 * before it begins emitting items to those Observers that have subscribed to it.
 *
 * <span class="informal">Makes a cold Observable hot</span>
 *
 * ![](publish.png)
 *
 * ## Examples
 * Make source$ hot by applying publish operator, then merge each inner observable into a single one
 * and subscribe.
 * ```ts
 * import { of, zip, interval, merge } from "rxjs";
 * import { map, publish, tap } from "rxjs/operators";
 *
 * const source$ = zip(interval(2000), of(1, 2, 3, 4, 5, 6, 7, 8, 9)).pipe(
 *   map(values => values[1])
 * );
 *
 * source$
 *   .pipe(
 *     publish(multicasted$ =>
 *       merge(
 *         multicasted$.pipe(tap(x => console.log('Stream 1:', x))),
 *         multicasted$.pipe(tap(x => console.log('Stream 2:', x))),
 *         multicasted$.pipe(tap(x => console.log('Stream 3:', x))),
 *       )
 *     )
 *   )
 *   .subscribe();
 *
 * // Results every two seconds
 * // Stream 1: 1
 * // Stream 2: 1
 * // Stream 3: 1
 * // ...
 * // Stream 1: 9
 * // Stream 2: 9
 * // Stream 3: 9
 * ```
 *
 * @param {Function} [selector] - Optional selector function which can use the multicasted source sequence as many times
 * as needed, without causing multiple subscriptions to the source sequence.
 * Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
 * @return A ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
 */
export function publish<T, R>(selector?: OperatorFunction<T, R>): MonoTypeOperatorFunction<T> | OperatorFunction<T, R> {
  return selector ? connect(selector) : multicast(new Subject<T>());
}
