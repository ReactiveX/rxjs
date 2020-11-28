/** @prettier */
import { OperatorFunction, ObservableInput, SubjectLike } from '../types';
import { Observable } from '../Observable';
import { Subject } from '../Subject';
import { from } from '../observable/from';
import { operate } from '../util/lift';
import { fromSubscribable } from '../observable/fromSubscribable';

/**
 * The default connector function used for `connect`.
 * A factory function that will create a {@link Subject}.
 */
function defaultConnector<T>() {
  return new Subject<T>();
}

/**
 * Creates an observable by multicasting the source within a function that
 * allows the developer to define the usage of the multicast prior to connection.
 *
 * This is particularly useful if the observable source you wish to multicast could
 * be synchronous or asynchronous. This sets it apart from {@link share}, which, in the
 * case of totally synchronous sources will fail to share a single subscription with
 * multiple consumers, as by the time the subscription to the result of {@link share}
 * has returned, if the source is synchronous its internal reference count will jump from
 * 0 to 1 back to 0 and reset.
 *
 * To use `connect`, you provide a `setup` function via configuration that will give you
 * a multicast observable that is not yet connected. You then use that multicast observable
 * to create a resulting observable that, when subscribed, will set up your multicast. This is
 * generally, but not always, accomplished with {@link merge}.
 *
 * Note that using a {@link takeUntil} inside of `connect`'s `setup` _might_ mean you were looking
 * to use the {@link takeWhile} operator instead.
 *
 * When you subscribe to the result of `connect`, the `setup` function will be called. After
 * the `setup` function returns, the observable it returns will be subscribed to, _then_ the
 * multicast will be connected to the source.
 *
 * ### Example
 *
 * Sharing a totally synchronous observable
 *
 * ```ts
 * import { defer, of } from 'rxjs';
 * import { tap, connect } from 'rxjs/operators';
 *
 * const source$ = defer(() => {
 *  console.log('subscription started');
 *  return of(1, 2, 3, 4, 5).pipe(
 *    tap(n => console.log(`source emitted ${n}`))
 *  );
 * });
 *
 * source$.pipe(
 *  connect({
 *    // Notice in here we're merging three subscriptions to `shared$`.
 *    setup: (shared$) => merge(
 *      shared$.pipe(map(n => `all ${n}`)),
 *      shared$.pipe(filter(n => n % 2 === 0), map(n => `even ${n}`)),
 *      shared$.pipe(filter(n => n % 2 === 1), map(n => `odd ${n}`)),
 *    )
 *  })
 * )
 * .subscribe(console.log);
 *
 * // Expected output: (notice only one subscription)
 * "subscription started"
 * "source emitted 1"
 * "all 1"
 * "odd 1"
 * "source emitted 2"
 * "all 2"
 * "even 2"
 * "source emitted 3"
 * "all 3"
 * "odd 3"
 * "source emitted 4"
 * "all 4"
 * "even 4"
 * "source emitted 5"
 * "all 5"
 * "odd 5"
 * ```
 *
 * @param param0 The configuration object for `connect`.
 */
export function connect<T, R>({
  connector = defaultConnector,
  setup,
}: {
  /**
   * A factory function used to create the Subject through which the source
   * is multicast. By default this creates a {@link Subject}.
   */
  connector?: () => SubjectLike<T>;
  /**
   * A function used to set up the multicast. Gives you a multicast observable
   * that is not yet connected. With that, you're expected to create and return
   * and Observable, that when subscribed to, will utilize the multicast observable.
   * After this function is executed -- and its return value subscribed to -- the
   * the operator will subscribe to the source, and the connection will be made.
   */
  setup: (shared: Observable<T>) => ObservableInput<R>;
}): OperatorFunction<T, R> {
  return operate((source, subscriber) => {
    const subject = connector();
    from(setup(fromSubscribable(subject))).subscribe(subscriber);
    subscriber.add(source.subscribe(subject));
  });
}
