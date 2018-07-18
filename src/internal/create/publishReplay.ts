import { multicast } from 'rxjs/internal/create/multicast';
import { ConnectableObservable } from 'rxjs/internal/ConnectableObservable';
import { Observable } from '../Observable';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';

export function publishReplay<T>(source: Observable<T>, bufferSize = Number.POSITIVE_INFINITY, windowTime = Number.POSITIVE_INFINITY): ConnectableObservable<T> {
  return multicast(source, new ReplaySubject<T>(bufferSize, windowTime));
}
