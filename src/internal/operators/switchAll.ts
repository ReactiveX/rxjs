import { OperatorFunction } from '../../internal/types';
import { ObservableInput } from '../Observable';
import { switchMap } from './switchMap';
import { identity } from '..//util/identity';

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T>;
export function switchAll<R>(): OperatorFunction<any, R>;

export function switchAll<T>(): OperatorFunction<ObservableInput<T>, T> {
  return switchMap(identity);
}
