import { multicast } from './multicast';
import { ConnectableObservable } from '../ConnectableObservable';
import { Observable } from '../Observable';
import { ReplaySubject } from '../ReplaySubject';

export function publishReplay<T>(source: Observable<T>, bufferSize = Number.POSITIVE_INFINITY, windowTime = Number.POSITIVE_INFINITY): ConnectableObservable<T> {
  return multicast(source, new ReplaySubject<T>(bufferSize, windowTime));
}
