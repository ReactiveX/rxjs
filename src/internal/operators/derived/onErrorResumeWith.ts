import { onErrorResumeNext } from '../../create/onErrorResumeNext';
import { Observable } from '../../Observable';
import { Operation } from '../../types';

export function onErrorResumeWith<T, R>(...sources: Array<Observable<R>>): Operation<T, T|R> {
  return (source: Observable<T>) => onErrorResumeNext<any>(source, ...sources);
}
