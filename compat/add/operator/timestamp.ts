import { Observable } from '../../internal/Observable';
import { timestamp } from '../../internal/patching/operator/timestamp';

Observable.prototype.timestamp = timestamp;

declare module '../../internal/Observable' {
  interface Observable<T> {
    timestamp: typeof timestamp;
  }
}
