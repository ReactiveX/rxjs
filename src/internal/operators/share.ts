import { OperatorFunction } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { multicast } from '../create/multicast';
import { Subscriber } from '../Subscriber';
import { Subject } from '../Subject';
import { ConnectableObservable } from '../ConnectableObservable';

export function share<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) => multicast(source, () => new Subject<T>()).lift(shareLift);
}

function shareLift<T>(this: Subscriber<T>, source: ConnectableObservable<T>, subscription: Subscription) {
  return source.refCount().subscribe(this, subscription);
}
