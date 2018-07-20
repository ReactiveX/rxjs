import { concatMap } from './concatMap';
import { ObservableInput, Operation } from '../../types';

export function concatMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return concatMap(() => source);
}
