import { map } from 'rxjs/internal/operators/map';
import { Operation, Timestamped } from 'rxjs/internal/types';

export function timestamp<T>(): Operation<T, Timestamped<T>> {
  return map((value: T) => ({ value, timestamp: Date.now() }));
}
