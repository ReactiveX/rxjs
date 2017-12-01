import { Observable } from '../Observable';
import { AsyncSubject } from '../internal/AsyncSubject';
import { multicast } from './multicast';
import { ConnectableObservable } from '../internal/observable/ConnectableObservable';
import { UnaryFunction } from '../interfaces';

export function publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>> {
  return (source: Observable<T>) => multicast(new AsyncSubject<T>())(source);
}
