import { ObservableInput } from '../types';
import { Observable } from '../Observable';
import { of } from './of';
import { mergeAll } from '../operators/derived/mergeAll';

export function merge<T>(...sources: ObservableInput<T>[]): Observable<T> {
  return of(...sources).pipe(mergeAll());
}
