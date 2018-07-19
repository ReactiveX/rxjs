import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from '../Observable';
import { of } from 'rxjs/internal/create/of';
import { concatAll } from 'rxjs/internal/operators/derived/concatAll';

export function concat<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(concatAll());
}
