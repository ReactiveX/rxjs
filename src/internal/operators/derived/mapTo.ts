import { map } from '../map';
import { Operation } from '../../types';

export function mapTo<T, R>(value: R): Operation<T, R> {
  return map(() => value);
}
