import { Observable } from '../Observable';
import { AsyncSubject } from '../AsyncSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../observable/ConnectableObservable';

export function publishLast<T>(source: Observable<T>): ConnectableObservable<T> {
  return multicast(source, new AsyncSubject<T>());
}
