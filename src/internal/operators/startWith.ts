import { concat } from '../create/concat';
import { from } from '../create/from';
import { Observable } from '../Observable';

export function startWith<T>(...values: T[]) {
  return (source: Observable<T>) => concat(from(values), source);
}
