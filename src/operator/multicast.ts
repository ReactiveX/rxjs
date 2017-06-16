import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { multicast as higherOrder } from '../operators';
import { FactoryOrValue, MonoTypeOperatorFunction } from '../interfaces';

/* tslint:disable:max-line-length */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: FactoryOrValue<Subject<T>>): ConnectableObservable<T>;
export function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: MonoTypeOperatorFunction<T>): Observable<T>;
/* tslint:enable:max-line-length */

/**
 * Returns an Observable that emits the results of invoking a specified selector on items
 * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.
 *
 * <img src="./img/multicast.png" width="100%">
 *
 * @param {Function|Subject} subjectOrSubjectFactory - Factory function to create an intermediate subject through
 * which the source sequence's elements will be multicast to the selector function
 * or Subject to push source elements into.
 * @param {Function} [selector] - Optional selector function that can use the multicasted source stream
 * as many times as needed, without causing multiple subscriptions to the source stream.
 * Subscribers to the given source will receive all notifications of the source from the
 * time of the subscription forward.
 * @return {Observable} An Observable that emits the results of invoking the selector
 * on the items emitted by a `ConnectableObservable` that shares a single subscription to
 * the underlying stream.
 * @method multicast
 * @owner Observable
 */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
                             selector?: (source: Observable<T>) => Observable<T>): Observable<T> | ConnectableObservable<T> {
  return higherOrder(<any>subjectOrSubjectFactory, selector)(this);
}
