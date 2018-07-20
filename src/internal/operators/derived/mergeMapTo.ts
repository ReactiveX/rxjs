import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { ObservableInput, Operation } from 'rxjs/internal/types';

export function mergeMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return mergeMap(() => source);
}
