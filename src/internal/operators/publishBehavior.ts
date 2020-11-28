import { Observable } from '../Observable';
import { BehaviorSubject } from '../BehaviorSubject';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * Creates a {@link ConnectableObservable} that utilizes a {@link BehaviorSubject}.
 * 
 * @param initialValue The initial value passed to the {@link BehaviorSubject}.
 * @return {ConnectableObservable<T>}
 * @deprecated to be removed in version 8. If you want to get a connectable observable that uses a 
 * {@link BehaviorSubject} under the hood, please use {@link connectable}. `source.pipe(publishBehavior(initValue))` 
 * is equivalent to: `connectable(source, () => new BehaviorSubject(initValue))`.
 * If you're using {@link refCount} after the call to `publishBehavior`, use the {@link share} operator, which is now
 * highly configurable. `source.pipe(publishBehavior(initValue), refCount())` is equivalent to:
 * `source.pipe(share({ connector: () => new BehaviorSubject(initValue), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false  }))`.
 */
export function publishBehavior<T>(initialValue: T):  UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  const subject = new BehaviorSubject<T>(initialValue);
  // Note that this has *never* supported the selector function.
  return (source) => new ConnectableObservable(source, () => subject);
}
