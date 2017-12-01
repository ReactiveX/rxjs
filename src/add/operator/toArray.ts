
import { Observable } from '../../internal/Observable';
import { toArray } from '../../internal/patching/operator/toArray';

Observable.prototype.toArray = toArray;

declare module '../../internal/Observable' {
  interface Observable<T> {
    toArray: typeof toArray;
  }
}
