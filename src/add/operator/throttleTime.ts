
import { Observable } from '../../Observable';
import { throttleTime } from '../../internal/patching/operator/throttleTime';

Observable.prototype.throttleTime = throttleTime;

declare module '../../Observable' {
  interface Observable<T> {
    throttleTime: typeof throttleTime;
  }
}
