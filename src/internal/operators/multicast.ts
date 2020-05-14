import { Subject } from '../Subject';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { OperatorFunction, UnaryFunction, ObservedValueOf, ObservableInput } from '../types';

// HACK: Used below to get publish operator variants that are supposed to
// return connectable observables to use `lift`. We can remove this once
// operators that return connectable observables are elimated.
const connectableObservableDescriptor: PropertyDescriptorMap = (() => {
  const connectableProto = ConnectableObservable.prototype;
  return {
    operator: { value: null },
    _refCount: { value: 0, writable: true },
    _subject: { value: null, writable: true },
    _connection: { value: null, writable: true },
    _subscribe: { value: connectableProto._subscribe },
    _isComplete: { value: connectableProto._isComplete, writable: true },
    getSubject: { value: (connectableProto as any).getSubject },
    connect: { value: connectableProto.connect },
    refCount: { value: connectableProto.refCount },
  };
})();

/* tslint:disable:max-line-length */
export function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
export function multicast<T, O extends ObservableInput<any>>(
  subject: Subject<T>,
  selector: (shared: Observable<T>) => O
): UnaryFunction<Observable<T>, ConnectableObservable<ObservedValueOf<O>>>;
export function multicast<T>(
  subjectFactory: (this: Observable<T>) => Subject<T>
): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
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
 * @param subjectOrSubjectFactory Factory function to create an intermediate subject through
 * which the source sequence's elements will be multicasted to the selector function
 * or Subject to push source elements into.
 * @param selector Optional selector function that can use the multicasted source stream
 * as many times as needed, without causing multiple subscriptions to the source stream.
 * Subscribers to the given source will receive all notifications of the source from the
 * time of the subscription forward.
 * @return An observable that emits the results of invoking the selector
 * on the items emitted by a {@link ConnectableObservable} that shares a single subscription to
 * the underlying stream.
 */
export function multicast<T, R>(
  subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
  selector?: (source: Observable<T>) => Observable<R>
): OperatorFunction<T, R> {
  return function multicastOperatorFunction(source: Observable<T>): Observable<R> {
    let subjectFactory: () => Subject<T>;
    if (typeof subjectOrSubjectFactory === 'function') {
      subjectFactory = subjectOrSubjectFactory;
    } else {
      subjectFactory = () => subjectOrSubjectFactory;
    }

    if (typeof selector === 'function') {
      return source.lift(new MulticastOperator(subjectFactory, selector));
    } else {
      // const connectable = new ConnectableObservable(source, subjectFactory);
      const connectable: any = Object.create(source, connectableObservableDescriptor);
      connectable.source = source;
      connectable.subjectFactory = subjectFactory;
      return connectable;
    }
  };
}

export class MulticastOperator<T, R> implements Operator<T, R> {
  constructor(private subjectFactory: () => Subject<T>, private selector: (source: Observable<T>) => Observable<R>) {}

  call(subscriber: Subscriber<R>, source: any): any {
    const { selector } = this;
    const subject = this.subjectFactory();
    const subscription = selector(subject).subscribe(subscriber);
    subscription.add(source.subscribe(subject));
    return subscription;
  }
}
