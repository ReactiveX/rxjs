import { concat } from 'rxjs/internal/create/concat';
import { from } from 'rxjs/internal/create/from';
import { Observable } from 'rxjs/internal/Observable';

export function endWith<T>(...values: T[]) {
  return (source: Observable<T>) => concat(source, from(values));
}
