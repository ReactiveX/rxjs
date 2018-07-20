import { switchMap } from '../switchMap';
import { ObservableInput, Operation } from '../../types';

export function switchMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return switchMap(() => source);
}
