
import { Observable } from '../../internal/Observable';
import { elementAt } from '../../internal/patching/operator/elementAt';

Observable.prototype.elementAt = elementAt;

declare module '../../internal/Observable' {
  interface Observable<T> {
    elementAt: typeof elementAt;
  }
}
