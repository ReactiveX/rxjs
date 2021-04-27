import { Observable } from '../Observable';
import { AsyncSubject } from '../AsyncSubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * Returns a connectable observable sequence that shares a single subscription to the
 * underlying sequence containing only the last notification.
 *
 * ![](publishLast.png)
 *
 * Similar to {@link publish}, but it waits until the source observable completes and stores
 * the last emitted value.
 * Similarly to {@link publishReplay} and {@link publishBehavior}, this keeps storing the last
 * value even if it has no more subscribers. If subsequent subscriptions happen, they will
 * immediately get that last stored value and complete.
 *
 * ## Example
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { publishLast, tap, take } from 'rxjs/operators';
 *
 * const connectable =
 *   interval(1000)
 *     .pipe(
 *       tap(x => console.log("side effect", x)),
 *       take(3),
 *       publishLast());
 *
 * connectable.subscribe(
 *   x => console.log(  "Sub. A", x),
 *   err => console.log("Sub. A Error", err),
 *   () => console.log( "Sub. A Complete"));
 *
 * connectable.subscribe(
 *   x => console.log(  "Sub. B", x),
 *   err => console.log("Sub. B Error", err),
 *   () => console.log( "Sub. B Complete"));
 *
 * connectable.connect();
 *
 * // Results:
 * //    "side effect 0"
 * //    "side effect 1"
 * //    "side effect 2"
 * //    "Sub. A 2"
 * //    "Sub. B 2"
 * //    "Sub. A Complete"
 * //    "Sub. B Complete"
 * ```
 *
 * @see {@link ConnectableObservable}
 * @see {@link publish}
 * @see {@link publishReplay}
 * @see {@link publishBehavior}
 *
 * @return A function that returns an Observable that emits elements of a
 * sequence produced by multicasting the source sequence.
 * @deprecated Will be removed in v8. To create a connectable observable with an
 * {@link AsyncSubject} under the hood, use {@link connectable}.
 * `source.pipe(publishLast())` is equivalent to
 * `connectable(source, { connector: () => new AsyncSubject(), resetOnDisconnect: false })`.
 * If you're using {@link refCount} after `publishLast`, use the {@link share} operator instead.
 * `source.pipe(publishLast(), refCount())` is equivalent to
 * `source.pipe(share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
 * Details: https://rxjs.dev/deprecations/multicasting
 */
export function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  const subject = new AsyncSubject<T>();
  // Note that this has *never* supported a selector function like `publish` and `publishReplay`.
  return (source) => new ConnectableObservable(source, () => subject);
}
