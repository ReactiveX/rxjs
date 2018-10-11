import { ObservableInput } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/create/of';
import { mergeAll } from 'rxjs/internal/operators/derived/mergeAll';

export function merge<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(mergeAll());
}
