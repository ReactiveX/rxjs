import { multicast } from './multicast';
import { ConnectableObservable } from '../ConnectableObservable';
import { Observable } from '../Observable';
import { Subject } from '../Subject';

export function publish<T>(source: Observable<T>): ConnectableObservable<T> {
  return multicast(source, new Subject<T>());
}
