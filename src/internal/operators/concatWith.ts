import { concat } from '../create/concat';
import { Observable } from '../Observable';
import { ObservableInput } from '../types';

export function concatWith<T>(...otherSources: ObservableInput<T>[]) {
  return (source: Observable<T>) => concat(source, ...otherSources);
}
