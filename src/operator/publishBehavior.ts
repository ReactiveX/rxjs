import { BehaviorSubject } from '../BehaviorSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

/**
 * @param value
 * @return {ConnectableObservable<T>}
 * @method publishBehavior
 * @owner Observable
 */
export function publishBehavior<T>(value: T): ConnectableObservable<T> {
  return multicast.call(this, new BehaviorSubject<T>(value));
}

export interface PublishBehaviorSignature<T> {
  (value: T): ConnectableObservable<T>;
}
