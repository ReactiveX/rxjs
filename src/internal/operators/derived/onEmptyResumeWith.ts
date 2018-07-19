import { Observable } from '../../Observable';
import { Operation} from 'rxjs/internal/types';
import { onEmptyResumeNext } from 'rxjs/internal/create/onEmptyResumeNext';

export function onEmptyResumeWith<T, R>(...sources: Array<Observable<R>>): Operation<T, T|R> {
  return (source: Observable<T>) => onEmptyResumeNext<any>(source, ...sources);
}

