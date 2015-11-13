import {Observable} from '../Observable';
import {BehaviorSubject} from '../subjects/BehaviorSubject';
import {multicast} from './multicast';

export function publishBehavior<T>(value: T): Observable<T> {
  return multicast.call(this, new BehaviorSubject(value));
}
