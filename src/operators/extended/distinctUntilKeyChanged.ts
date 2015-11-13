import {Observable} from '../../Observable';
import {distinctUntilChanged} from '../distinctUntilChanged';
import {_Comparer} from '../../types';

export function distinctUntilKeyChanged<T>(key: string, compare?: _Comparer<T, boolean>, thisArg?: any): Observable<T> {
  return distinctUntilChanged.call(this, function(x, y) {
    if (compare) {
      return compare.call(thisArg, x[key], y[key]);
    }
    return x[key] === y[key];
  });
}
