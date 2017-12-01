
import { Observable } from '../../internal/Observable';
import { throttle } from '../../internal/patching/operator/throttle';

Observable.prototype.throttle = throttle;

declare module '../../internal/Observable' {
  interface Observable<T> {
    throttle: typeof throttle;
  }
}
