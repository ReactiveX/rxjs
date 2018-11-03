import { switchMap } from 'rxjs/internal/operators/switchMap';
import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';

export function switchMapTo<T, R>(source: ObservableInput<R>): OperatorFunction<T, R> {
  return switchMap(() => source);
}
