import { mergeMap } from '../mergeMap';
import { ObservableInput, Operation } from 'rxjs/internal/types';

export function concatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): Operation<T, R> {
  return mergeMap(project, 1);
}
