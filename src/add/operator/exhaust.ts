
import { Observable } from '../../internal/Observable';
import { exhaust } from '../../internal/patching/operator/exhaust';

Observable.prototype.exhaust = exhaust;

declare module '../../internal/Observable' {
  interface Observable<T> {
    exhaust: typeof exhaust;
  }
}
