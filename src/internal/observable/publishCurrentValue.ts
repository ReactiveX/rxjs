import { Observable } from '../Observable';
import { BehaviorSubject as CurrentValueSubject } from '../BehaviorSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

export function publishCurrentValue<T>(source: Observable<T>, initialValue: T): ConnectableObservable<T> {
  return multicast(source, new CurrentValueSubject<T>(initialValue));
}
