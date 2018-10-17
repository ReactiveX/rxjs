import { ObservableInput, Operation } from 'rxjs/internal/types';
import { identity } from 'rxjs/internal/util/identity';
import { switchMap } from 'rxjs/internal/operators/switchMap';

export function switchAll<T>(): Operation<ObservableInput<T>, T>;
export function switchAll<R>(): Operation<any, R>;

export function switchAll<T>(): Operation<ObservableInput<T>, T> {
  return switchMap(identity);
}
