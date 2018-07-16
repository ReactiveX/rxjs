import { distinctUntilChanged } from '../distinctUntilChanged';
import { Operation } from '../../types';

export function distinctUntilKeyChanged<T>(key: string, compare?: (x: T, y: T) => boolean): Operation<T, T> {
  return distinctUntilChanged((x: T, y: T) => compare ? compare(x[key], y[key]) : x[key] === y[key]);
}
