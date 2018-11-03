import { onErrorResumeNext } from 'rxjs/internal/create/onErrorResumeNext';
import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction } from 'rxjs/internal/types';

export function onErrorResumeWith<T, R>(...sources: Array<Observable<R>>): OperatorFunction<T, T|R> {
  return (source: Observable<T>) => onErrorResumeNext<any>(source, ...sources);
}
