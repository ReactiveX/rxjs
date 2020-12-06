/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { OperatorFunction, UnaryFunction, ObservedValueOf, ObservableInput } from '../types';
import { hasLift } from '../util/lift';
import { isFunction } from '../util/isFunction';
import { connect } from './connect';

/**
 * An operator that creates a {@link ConnectableObservable}, that when connected,
 * with the `connect` method, will use the provided subject to multicast the values
 * from the source to all consumers.
 *
 * @param subject The subject to multicast through.
 * @deprecated This will be removed in version 8. Please use the {@link connectable} creation
 * function, which creates a connectable observable. If you were using the {@link refCount} operator
 * on the result of the `multicast` operator, then use the {@link share} operator, which is now
 * highly configurable. `multicast(subject), refCount()` is equivalent to
 * `share({ connector: () => subject, resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
 */
export function multicast<T>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Because this is deprecated in favor of the {@link connect} operator, and was otherwise poorly documented,
 * rather than duplicate the effort of documenting the same behavior, please see documentation for the
 * {@link connect} operator.
 *
 * @param subject The subject used to multicast.
 * @param selector A setup function to setup the multicast
 * @deprecated To be removed in version 8. Please use the new {@link connect} operator.
 * `multicast(subject, fn)` is equivalent to `connect({ connector: () => subject, setup: fn })`.
 */
export function multicast<T, O extends ObservableInput<any>>(
  subject: Subject<T>,
  selector: (shared: Observable<T>) => O
): OperatorFunction<T, ObservedValueOf<O>>;

/**
 * An operator that creates a {@link ConnectableObservable}, that when connected,
 * with the `connect` method, will use the provided subject to multicast the values
 * from the source to all consumers.
 *
 * @param subjectFactory A factory that will be called to create the subject. Passing a function here
 * will cause the underlying subject to be "reset" on error, completion, or refCounted unsubscription of
 * the source.
 * @deprecated This will be removed in version 8. Please use the {@link connectable} creation
 * function, which creates a connectable observable. If you were using the {@link refCount} operator
 * on the result of the `multicast` operator, then use the {@link share} operator, which is now
 * highly configurable. `multicast(() => new BehaviorSubject('test'))), refCount()` is equivalent to
 * `share({ connector: () => new BehaviorSubject('test') })`.
 */
export function multicast<T>(subjectFactory: () => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;

/**
 * Because this is deprecated in favor of the {@link connect} operator, and was otherwise poorly documented,
 * rather than duplicate the effort of documenting the same behavior, please see documentation for the
 * {@link connect} operator.
 *
 * @param subjectFactory A factory that creates the subject used to multicast.
 * @param selector A function to setup the multicast and select the output.
 * @deprecated To be removed in version 8. Please use the new {@link connect} operator.
 * `multicast(subjectFactor, selector)` is equivalent to `connect(selector, { connector: subjectFactory })`.
 */
export function multicast<T, O extends ObservableInput<any>>(
  subjectFactory: () => Subject<T>,
  selector: (shared: Observable<T>) => O
): OperatorFunction<T, ObservedValueOf<O>>;

export function multicast<T, R>(
  subjectOrSubjectFactory: Subject<T> | (() => Subject<T>),
  selector?: (source: Observable<T>) => Observable<R>
): OperatorFunction<T, R> {
  const subjectFactory = isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : () => subjectOrSubjectFactory;

  if (isFunction(selector)) {
    // If a selector function is provided, then we're a "normal" operator that isn't
    // going to return a ConnectableObservable. We can use `connect` to do what we
    // need to do.
    return connect(selector, {
      connector: subjectFactory,
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
