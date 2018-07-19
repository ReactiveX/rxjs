import { multicast } from 'rxjs/internal/create/multicast';
import { ConnectableObservable } from 'rxjs/internal/ConnectableObservable';
import { Observable } from '../Observable';
import { Subject } from 'rxjs/internal/Subject';

export function publish<T>(source: Observable<T>): ConnectableObservable<T> {
  return multicast(source, new Subject<T>());
}
