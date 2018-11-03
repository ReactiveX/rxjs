import { map } from 'rxjs/internal/operators/map';
import { OperatorFunction } from 'rxjs/internal/types';

export function mapTo<T, R>(value: R): OperatorFunction<T, R> {
  return map(() => value);
}
