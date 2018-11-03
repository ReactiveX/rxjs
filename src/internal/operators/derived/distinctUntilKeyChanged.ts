import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { OperatorFunction } from 'rxjs/internal/types';

export function distinctUntilKeyChanged<T>(key: string, compare?: (x: T, y: T) => boolean): OperatorFunction<T, T> {
  return distinctUntilChanged((x: T, y: T) => compare ? compare(x[key], y[key]) : x[key] === y[key]);
}
