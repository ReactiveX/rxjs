import { of, throwError } from 'rxjs';
import { query } from '../../src/internal/operators/query';
import { QueryResult } from '../../src/internal/types';

it('should infer QueryResult<T> when T is string', () => {
  const result = of('hello').pipe(query());
  // $ExpectType Observable<QueryResult<string>>
});

it('should handle error types correctly', () => {
  const result = throwError(() => new Error()).pipe(query());
  // $ExpectType Observable<QueryResult<unknown>>
});
