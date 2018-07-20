import { switchMap } from 'rxjs/internal/operators/switchMap';
import { ObservableInput, Operation } from 'rxjs/internal/types';

export function switchMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return switchMap(() => source);
}
