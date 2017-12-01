import { Observable } from '../../../Observable';
import { ConnectableObservable } from '../../../internal/observable/ConnectableObservable';
import { publishLast as higherOrder } from '../../../internal/operators/publishLast';
/**
 * @return {ConnectableObservable<T>}
 * @method publishLast
 * @owner Observable
 */
export function publishLast<T>(this: Observable<T>): ConnectableObservable<T> {
  //TODO(benlesh): correct type-flow through here.
  return higherOrder()(this) as ConnectableObservable<T>;
}
