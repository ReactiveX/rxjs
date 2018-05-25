import { concat } from '../create/concat';
import { from } from '../create/from';
import { Observable } from '../Observable';

export function endWith<T>(...values: T[]) {
  return (source: Observable<T>) => concat(source, from(values));
}
