import { concatMap } from 'rxjs/internal/operators/derived/concatMap';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';

export function concatMapTo<T, R>(source: ObservableInput<R>): OperatorFunction<T, R> {
  return concatMap(() => source);
}
