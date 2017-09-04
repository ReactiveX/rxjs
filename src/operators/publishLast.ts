import { Observable } from '../Observable';
import { AsyncSubject } from '../AsyncSubject';
import { multicast } from './multicast';
import { OperatorFunction } from '../interfaces';

//TODO(benlesh): specify that the second type is actually a ConnectableObservable
export function publishLast<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) => multicast(new AsyncSubject<T>())(source);
}
