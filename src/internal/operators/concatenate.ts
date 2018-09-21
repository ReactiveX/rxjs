import { scan } from 'rxjs/internal/operators/scan';
import { OperatorFunction } from 'rxjs/internal/types';
import { toArrayReducer } from 'rxjs/internal/util/toArrayReducer';

export function concatenate<T>(): OperatorFunction<T, T[]> {
  return scan(toArrayReducer, []) as OperatorFunction<T, T[]>;
}
