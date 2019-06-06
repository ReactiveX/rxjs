import { Observable } from '../Observable';
import { CurrentValueSubject } from '../CurrentValueSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';
import { UnaryFunction } from '../types';

/**
 * @param value
 * @return {ConnectableObservable<T>}
 * @method publishBehavior
 * @owner Observable
 */
export function publishBehavior<T>(value: T):  UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  return (source: Observable<T>) => multicast(new CurrentValueSubject<T>(value))(source) as ConnectableObservable<T>;
}
