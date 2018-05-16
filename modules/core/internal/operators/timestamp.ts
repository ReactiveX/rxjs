import { map } from './map';
import { Operation, Timestamped } from '../types';

export function timestamp<T>(): Operation<T, Timestamped<T>> {
  return map((value: T) => ({ value, timestamp: Date.now() }));
}
