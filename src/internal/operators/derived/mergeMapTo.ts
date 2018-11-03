import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';

export function mergeMapTo<T, R>(source: ObservableInput<R>): OperatorFunction<T, R> {
  return mergeMap(() => source);
}
