
import { Observable } from '../../Observable';
import { timeout, TimeoutSignature } from '../../operator/timeout';

Observable.prototype.timeout = timeout;

declare module '../../Observable' {
  interface Observable<T> {
    timeout: TimeoutSignature<T>;
  }
}