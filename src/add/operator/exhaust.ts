
import { Observable } from '../../Observable';
import { exhaust } from '../../internal/patching/operator/exhaust';

Observable.prototype.exhaust = exhaust;

declare module '../../Observable' {
  interface Observable<T> {
    exhaust: typeof exhaust;
  }
}
