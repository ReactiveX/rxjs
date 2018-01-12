
import { Observable } from '../../internal/Observable';
import { windowTime } from '../../internal/patching/operator/windowTime';

Observable.prototype.windowTime = windowTime;

declare module '../../internal/Observable' {
  interface Observable<T> {
    windowTime: typeof windowTime;
  }
}
