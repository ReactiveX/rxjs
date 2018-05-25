import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { of } from './of';
import { concatAll } from '../operators/concatAll';

export function concat<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(concatAll());
}
