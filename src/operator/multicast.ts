import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ConnectableObservable, connectableObservableDescriptor } from '../observable/ConnectableObservable';

/**
 * Returns an Observable that emits the results of invoking a specified selector on items
 * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.
 *
 * <img src="./img/multicast.png" width="100%">
 *
 * @param {Function|Subject} Factory function to create an intermediate subject through
 * which the source sequence's elements will be multicast to the selector function
 * or Subject to push source elements into.
 * @param {Function} Optional selector function that can use the multicasted source stream
 * as many times as needed, without causing multiple subscriptions to the source stream.
 * Subscribers to the given source will receive all notifications of the source from the
 * time of the subscription forward.
 * @return {Observable} an Observable that emits the results of invoking the selector
 * on the items emitted by a `ConnectableObservable` that shares a single subscription to
 * the underlying stream.
 * @method multicast
 * @owner Observable
 */
/* tslint:disable:max-line-length */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: factoryOrValue<Subject<T>>): ConnectableObservable<T>;
export function multicast<T>(SubjectFactory: (this: Observable<T>) => Subject<T>, selector?: selector<T>): Observable<T>;
/* tslint:disable:max-line-length */
export function multicast<T>(this: Observable<T>, subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
                             selector?: (source: Observable<T>) => Observable<T>): Observable<T> | ConnectableObservable<T> {
  let subjectFactory: () => Subject<T>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <() => Subject<T>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }

  if (typeof selector === 'function') {
    return this.lift(new MulticastOperator(subjectFactory, selector));
  }

  const connectable: any = Object.create(this, connectableObservableDescriptor);
  connectable.source = this;
  connectable.subjectFactory = subjectFactory;

  return <ConnectableObservable<T>> connectable;
}

export type factoryOrValue<T> = T | (() => T);
export type selector<T> = (source: Observable<T>) => Observable<T>;

export class MulticastOperator<T> implements Operator<T, T> {
  constructor(private subjectFactory: () => Subject<T>,
              private selector: (source: Observable<T>) => Observable<T>) {
  }
  call(subscriber: Subscriber<T>, self: any): any {
    const { selector } = this;
    const connectable = new ConnectableObservable(self.source, this.subjectFactory);
    const subscription = selector(connectable).subscribe(subscriber);
    subscription.add(connectable.connect());
    return subscription;
  }
}
