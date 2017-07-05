import { reduce } from './reduce';
import { OperatorFunction } from '../interfaces';

function toArrayReducer<T>(acc: T[], value: T) {
  acc.push(value);
  return acc;
}

export function toArray<T>(): OperatorFunction<T, T[]> {
  return reduce(toArrayReducer, []);
}