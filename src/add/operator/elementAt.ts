
import { Observable } from '../../Observable';
import { elementAt } from '../../internal/patching/operator/elementAt';

Observable.prototype.elementAt = elementAt;

declare module '../../Observable' {
  interface Observable<T> {
    elementAt: typeof elementAt;
  }
}
