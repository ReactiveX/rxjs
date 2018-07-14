import { concat } from 'rxjs/internal/create/concat';
import { Observable } from 'rxjs/internal/Observable';
import { ObservableInput } from 'rxjs/internal/types';

export function concatWith<T>(...otherSources: ObservableInput<T>[]) {
  return (source: Observable<T>) => concat(source, ...otherSources);
}
