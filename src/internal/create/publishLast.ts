import { multicast } from 'rxjs/internal/create/multicast';
import { ConnectableObservable } from 'rxjs/internal/ConnectableObservable';
import { Observable } from 'rxjs/internal/Observable';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';

export function publishLast<T>(source: Observable<T>): ConnectableObservable<T> {
  return multicast(source, new AsyncSubject<T>());
}
