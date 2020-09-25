/** @prettier */
import { Notification } from '../Notification';
import { OperatorFunction, ObservableNotification } from '../types';
import { operate } from '../util/lift';
import { OperatorSubscriber } from './OperatorSubscriber';

/**
 * Represents all of the notifications from the source Observable as `next`
 * emissions marked with their original types within {@link Notification}
 * objects.
 *
 * <span class="informal">Wraps `next`, `error` and `complete` emissions in
 * {@link Notification} objects, emitted as `next` on the output Observable.
 * </span>
 *
 * ![](materialize.png)
 *
 * `materialize` returns an Observable that emits a `next` notification for each
 * `next`, `error`, or `complete` emission of the source Observable. When the
 * source Observable emits `complete`, the output Observable will emit `next` as
 * a Notification of type "complete", and then it will emit `complete` as well.
 * When the source Observable emits `error`, the output will emit `next` as a
 * Notification of type "error", and then `complete`.
 *
 * This operator is useful for producing metadata of the source Observable, to
 * be consumed as `next` emissions. Use it in conjunction with
 * {@link dematerialize}.
 *
 * ## Example
 *
 * Convert a faulty Observable to an Observable of Notifications
 *
 * ```ts
 * import { of } from 'rxjs';
 * import { materialize, map } from 'rxjs/operators';
 *
 * const letters = of('a', 'b', 13, 'd');
 * const upperCase = letters.pipe(map(x => x.toUpperCase()));
 * const materialized = upperCase.pipe(materialize());
 * materialized.subscribe(x => console.log(x));
 *
 * // Results in the following:
 * // - Notification {kind: "N", value: "A", error: undefined, hasValue: true}
 * // - Notification {kind: "N", value: "B", error: undefined, hasValue: true}
 * // - Notification {kind: "E", value: undefined, error: TypeError:
 * //   x.toUpperCase is not a function at MapSubscriber.letters.map.x
 * //   [as project] (http://1…, hasValue: false}
 * ```
 *
 * @see {@link Notification}
 * @see {@link dematerialize}
 *
 * @return {Observable<Notification<T>>} An Observable that emits
 * {@link Notification} objects that wrap the original emissions from the source
 * Observable with metadata.
 *
 * @deprecated In version 8, materialize will start to emit {@link ObservableNotification} objects, and not
 * {@link Notification} instances. This means that methods that are not commonly used, like `Notification.observe`
 * will not be available on the emitted values at that time.
 */
export function materialize<T>(): OperatorFunction<T, Notification<T> & ObservableNotification<T>> {
  return operate((source, subscriber) => {
    source.subscribe(
      new OperatorSubscriber(
        subscriber,
        (value) => {
          subscriber.next(Notification.createNext(value));
        },
        (err) => {
          subscriber.next(Notification.createError(err));
          subscriber.complete();
        },
        () => {
          subscriber.next(Notification.createComplete());
          subscriber.complete();
        }
      )
    );
  });
}
