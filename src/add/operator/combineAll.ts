
import { Observable } from '../../Observable';
import { combineAll } from '../../internal/patching/operator/combineAll';

Observable.prototype.combineAll = combineAll;

declare module '../../Observable' {
  interface Observable<T> {
    combineAll: typeof combineAll;
  }
}
