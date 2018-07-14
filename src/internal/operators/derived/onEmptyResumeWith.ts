import { Observable } from '../../Observable';
import { Operation} from '../../types';
import { onEmptyResumeNext } from '../../create/onEmptyResumeNext';

export function onEmptyResumeWith<T, R>(...sources: Array<Observable<R>>): Operation<T, T|R> {
  return (source: Observable<T>) => onEmptyResumeNext<any>(source, ...sources);
}

