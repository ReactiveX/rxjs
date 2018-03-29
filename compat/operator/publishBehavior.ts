import { ConnectableObservable, Observable } from 'rxjs';
import { publishBehavior as higherOrder } from 'rxjs/operators';

/**
 * @param value
 * @return {ConnectableObservable<T>}
 * @method publishBehavior
 * @owner Observable
 */
export function publishBehavior<T>(this: Observable<T>, value: T): ConnectableObservable<T> {
  return higherOrder(value)(this);
}
