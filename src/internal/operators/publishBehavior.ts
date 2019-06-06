import { Observable } from '../Observable';
import { BehaviorSubject } from '../BehaviorSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * @param initialValue
 * @deprecated remove in v8. Use static {@link publishCurrentValue}.
 */
export function publishBehavior<T>(initialValue: T):  UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  return (source: Observable<T>) => multicast(new BehaviorSubject<T>(initialValue))(source) as ConnectableObservable<T>;
}
