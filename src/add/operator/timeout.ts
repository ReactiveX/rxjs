
import { Observable } from '../../internal/Observable';
import { timeout } from '../../internal/patching/operator/timeout';

Observable.prototype.timeout = timeout;

declare module '../../internal/Observable' {
  interface Observable<T> {
    timeout: typeof timeout;
  }
}
