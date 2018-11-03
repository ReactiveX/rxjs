import { ObservableInput, OperatorFunction } from 'rxjs/internal/types';
import { identity } from 'rxjs/internal/util/identity';
import { switchMap } from 'rxjs/internal/operators/switchMap';

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T>;
export function switchAll<R>(): OperatorFunction<any, R>;

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T> {
  return switchMap(identity);
}
