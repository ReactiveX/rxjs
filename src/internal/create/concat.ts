import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { of } from './of';
import { concatAll } from 'rxjs/internal/operators/derived/concatAll';

export function concat<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(concatAll());
}
