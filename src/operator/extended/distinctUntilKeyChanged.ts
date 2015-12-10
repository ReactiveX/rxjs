import {distinctUntilChanged} from '../distinctUntilChanged';
import {Observable} from '../../Observable';
import {_Comparer} from '../../types';

export function distinctUntilKeyChanged<T>(key: string, compare?: _Comparer<T, boolean>): Observable<T> {
  return distinctUntilChanged.call(this, function(x: T, y: T) {
    if (compare) {
      return compare(x[key], y[key]);
    }
    return x[key] === y[key];
  });
}
