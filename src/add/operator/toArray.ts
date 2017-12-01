
import { Observable } from '../../Observable';
import { toArray } from '../../internal/patching/operator/toArray';

Observable.prototype.toArray = toArray;

declare module '../../Observable' {
  interface Observable<T> {
    toArray: typeof toArray;
  }
}
