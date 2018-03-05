
import { Observable } from '../../internal/Observable';
import { combineAll } from '../../internal/patching/operator/combineAll';

Observable.prototype.combineAll = combineAll;

declare module '../../internal/Observable' {
  interface Observable<T> {
    combineAll: typeof combineAll;
  }
}
