import { map } from 'rxjs/internal/operators/map';
import { OperatorFunction, Timestamped } from 'rxjs/internal/types';

export function timestamp<T>(): OperatorFunction<T, Timestamped<T>> {
  return map((value: T) => ({ value, timestamp: Date.now() }));
}
