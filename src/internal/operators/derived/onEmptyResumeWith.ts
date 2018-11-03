import { Observable } from 'rxjs/internal/Observable';
import { OperatorFunction} from 'rxjs/internal/types';
import { onEmptyResumeNext } from 'rxjs/internal/create/onEmptyResumeNext';

export function onEmptyResumeWith<T, R>(...sources: Array<Observable<R>>): OperatorFunction<T, T|R> {
  return (source: Observable<T>) => onEmptyResumeNext<any>(source, ...sources);
}

