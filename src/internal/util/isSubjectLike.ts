import { isObservableLike } from 'rxjs/internal/util/isObservableLike';
import { isObserver } from 'rxjs/internal/util/isObserver';
import { Subject } from 'rxjs/internal/Subject';

export function isSubjectLike<T>(obj: any): obj is Subject<T> {
  return isObservableLike(obj) && isObserver(obj);
}
