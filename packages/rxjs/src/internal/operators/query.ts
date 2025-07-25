import { Observable, of } from 'rxjs';
import { QueryResult } from '../types';
import { startWith, catchError, map } from 'rxjs/operators';

/**
 * Transforms an observable into a query result observable.
 *
 * The query result observable will emit one of the following states:
 *
 * - `isLoading: true, data: null, error: null` when the source observable is
 *   executing.
 * - `isLoading: false, data: T, error: null` when the source observable
 *   completes successfully.
 * - `isLoading: false, data: null, error: Error` when the source observable
 *   throws an error.
 *
 * The first state is sent immediately using `startWith`, the others are sent
 * when the source observable completes or throws an error.
 *
 * @param source$ The source observable to transform
 * @returns An observable that emits the query result
 */
export function query<T>() {
  return (source$: Observable<T>): Observable<QueryResult<T>> => {
    return source$.pipe(
        map((data) => ({ isLoading: false, data, error: null })),
        catchError((error) =>
          of({ isLoading: false, data: null, error })
        ),
        startWith({ isLoading: true, data: null, error: null })
      )
  }
}
