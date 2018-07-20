import { concatMap } from 'rxjs/internal/operators/derived/concatMap';
import { ObservableInput, Operation } from 'rxjs/internal/types';

export function concatMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return concatMap(() => source);
}
