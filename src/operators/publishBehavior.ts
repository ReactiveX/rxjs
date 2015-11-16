import {ConnectableObservable} from '../observables/ConnectableObservable';
import {BehaviorSubject} from '../subjects/BehaviorSubject';
import {multicast} from './multicast';

export function publishBehavior<T>(value: T): ConnectableObservable<T> {
  return multicast.call(this, new BehaviorSubject(value));
}
