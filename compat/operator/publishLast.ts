import { ConnectableObservable, Observable } from 'rxjs';
import { publishLast as higherOrder } from 'rxjs/operators';
/**
 * @return {ConnectableObservable<T>}
 * @method publishLast
 * @owner Observable
 */
export function publishLast<T>(this: Observable<T>): ConnectableObservable<T> {
  //TODO(benlesh): correct type-flow through here.
  return higherOrder<T>()(this) as ConnectableObservable<T>;
}
