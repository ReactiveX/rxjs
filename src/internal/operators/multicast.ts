/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { OperatorFunction, UnaryFunction, ObservedValueOf, ObservableInput } from '../types';
import { hasLift, operate } from '../util/lift';
import { isFunction } from '../util/isFunction';

/* tslint:disable:max-line-length */
export function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export function multicast<T, O extends ObservableInput<any>>(
  subject: Subject<T>,
  selector: (shared: Observable<T>) => O
): UnaryFunction<Observable<T>, ConnectableObservable<ObservedValueOf<O>>>;
export function multicast<T>(subjectFactory: (this: Observable<T>) => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export function multicast<T, O extends ObservableInput<any>>(
  SubjectFactory: (this: Observable<T>) => Subject<T>,
  selector: (shared: Observable<T>) => O
): OperatorFunction<T, ObservedValueOf<O>>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits the results of invoking a specified selector on items
 * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.
 *
 * ![](multicast.png)
 *
 * @param {Function|Subject} subjectOrSubjectFactory - Factory function to create an intermediate subject through
 * which the source sequence's elements will be multicasted to the selector function
 * or Subject to push source elements into.
 * @param {Function} [selector] - Optional selector function that can use the multicasted source stream
 * as many times as needed, without causing multiple subscriptions to the source stream.
 * Subscribers to the given source will receive all notifications of the source from the
 * time of the subscription forward.
 * @return {Observable} An Observable that emits the results of invoking the selector
 * on the items emitted by a `ConnectableObservable` that shares a single subscription to
 * the underlying stream.
 * @name multicast
 */
export function multicast<T, R>(
  subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
  selector?: (source: Observable<T>) => Observable<R>
): OperatorFunction<T, R> {
  const subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;

  if (isFunction(selector)) {
    return operate((source, subscriber) => {
      const subject = subjectFactory();
      // Intentionally terse code: Subscribe to the result of the selector,
      // then immediately connect the source through the subject, adding
      // that to the resulting subscription. The act of subscribing with `this`,
      // the primary destination subscriber, will automatically add the subscription
      // to the result.
      selector(subject).subscribe(subscriber).add(source.subscribe(subject));
    });
  }

  return (source: Observable<T>) => {
    const connectable: any = new ConnectableObservable(source, subjectFactory);
    // If we have lift, monkey patch that here. This is done so custom observable
    // types will compose through multicast. Otherwise the resulting observable would
    // simply be an instance of `ConnectableObservable`.
    if (hasLift(source)) {
      connectable.lift = source.lift;
    }
    connectable.source = source;
    connectable.subjectFactory = subjectFactory;
    return connectable;
  };
}
