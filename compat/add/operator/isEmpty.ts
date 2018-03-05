
import { Observable } from '../../internal/Observable';
import { isEmpty } from '../../internal/patching/operator/isEmpty';

Observable.prototype.isEmpty = isEmpty;

declare module '../../internal/Observable' {
  interface Observable<T> {
    isEmpty: typeof isEmpty;
  }
}
