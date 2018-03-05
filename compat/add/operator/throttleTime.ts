
import { Observable } from '../../internal/Observable';
import { throttleTime } from '../../internal/patching/operator/throttleTime';

Observable.prototype.throttleTime = throttleTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    throttleTime: typeof throttleTime;
  }
}
