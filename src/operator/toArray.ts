
import { Observable } from '../Observable';
import { toArray as higherOrder } from '../operators';

/**
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
export function toArray<T>(this: Observable<T>): Observable<T[]> {
  return higherOrder()(this);
}
