
import { Observable } from '../../Observable';
import { timeout } from '../../internal/patching/operator/timeout';

Observable.prototype.timeout = timeout;

declare module '../../Observable' {
  interface Observable<T> {
    timeout: typeof timeout;
  }
}
