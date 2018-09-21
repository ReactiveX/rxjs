import { reduce } from './reduce';
import { OperatorFunction } from '../types';
import { toArrayReducer } from 'rxjs/internal/util/toArrayReducer';

export function toArray<T>(): OperatorFunction<T, T[]> {
  return reduce(toArrayReducer, []) as OperatorFunction<T, T[]>;
}
