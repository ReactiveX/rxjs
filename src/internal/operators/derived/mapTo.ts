import { map } from 'rxjs/internal/operators/map';
import { Operation } from 'rxjs/internal/types';

export function mapTo<T, R>(value: R): Operation<T, R> {
  return map(() => value);
}
