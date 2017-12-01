
import { Observable } from '../../Observable';
import { isEmpty } from '../../internal/patching/operator/isEmpty';

Observable.prototype.isEmpty = isEmpty;

declare module '../../Observable' {
  interface Observable<T> {
    isEmpty: typeof isEmpty;
  }
}
