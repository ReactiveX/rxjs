
import { Observable } from '../../Observable';
import { timeInterval } from '../../internal/patching/operator/timeInterval';

Observable.prototype.timeInterval = timeInterval;

declare module '../../Observable' {
  interface Observable<T> {
    timeInterval: typeof timeInterval;
  }
}
