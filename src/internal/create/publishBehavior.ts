import { multicast } from 'rxjs/internal/create/multicast';
import { ConnectableObservable } from 'rxjs/internal/ConnectableObservable';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export function publishBehavior<T>(source: Observable<T>, initialValue: T): ConnectableObservable<T> {
  return multicast(source, new BehaviorSubject<T>(initialValue));
}
