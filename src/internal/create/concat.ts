import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { of } from '../create/of';
import { concatAll } from '../operators/derived/concatAll';

export function concat<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(concatAll());
}
