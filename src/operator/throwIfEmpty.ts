import { Observable } from '../Observable';
import { throwIfEmpty as higherOrder, defaultErrorFactory } from '../operators/throwIfEmpty';

export function throwIfEmpty<T>(this: Observable<T>,
                                errorFactory: (() => any) = defaultErrorFactory): Observable<T> {
  return higherOrder(errorFactory)(this) as Observable<T>;
}
