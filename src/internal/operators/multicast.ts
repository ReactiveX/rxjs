/** @prettier */
import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { OperatorFunction, UnaryFunction, ObservedValueOf, ObservableInput } from '../types';
import { hasLift, lift } from '../util/lift';

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
  return function multicastOperatorFunction(source: Observable<T>): Observable<R> {
    const subjectFactory = typeof subjectOrSubjectFactory === 'function' ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;

    if (typeof selector === 'function') {
      return lift(source, function (this: Subscriber<R>, source: Observable<T>) {
        const subject = subjectFactory();
        // Intentionally terse code: Subscribe to the result of the selector,
        // then immediately connect the source through the subject, adding
        // that to the resulting subscription. The act of subscribing with `this`,
        // the primary destination subscriber, will automatically add the subcription
        // to the result.
        selector(subject).subscribe(this).add(source.subscribe(subject));
      });
    }

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
