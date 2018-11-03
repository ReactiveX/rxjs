import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';

export function concatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): OperatorFunction<T, R> {
  return mergeMap(project, 1);
}
