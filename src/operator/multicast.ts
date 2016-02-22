import {Subject} from '../Subject';
import {ConnectableObservable} from '../observable/ConnectableObservable';

/**
 * Returns an Observable that emits the results of invoking a specified selector on items
 * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.
 *
 * <img src="./img/multicast.png" width="100%">
 *
 * @param {Function} selector - a function that can use the multicasted source stream
 * as many times as needed, without causing multiple subscriptions to the source stream.
 * Subscribers to the given source will receive all notifications of the source from the
 * time of the subscription forward.
 * @return {Observable} an Observable that emits the results of invoking the selector
 * on the items emitted by a `ConnectableObservable` that shares a single subscription to
 * the underlying stream.
 * @method multicast
 * @owner Observable
 */
export function multicast<T>(subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)): ConnectableObservable<T> {
  let subjectFactory: () => Subject<T>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <() => Subject<T>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }
  return new ConnectableObservable(this, subjectFactory);
}

export type factoryOrValue<T> = T | (() => T);

export interface MulticastSignature<T> {
  (subjectOrSubjectFactory: factoryOrValue<Subject<T>>): ConnectableObservable<T>;
}
