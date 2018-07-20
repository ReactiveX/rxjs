import { mergeMap } from '../mergeMap';
import { ObservableInput, Operation } from '../../types';

export function mergeMapTo<T, R>(source: ObservableInput<R>): Operation<T, R> {
  return mergeMap(() => source);
}
