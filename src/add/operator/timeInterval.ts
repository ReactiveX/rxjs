
import { Observable } from '../../internal/Observable';
import { timeInterval } from '../../internal/patching/operator/timeInterval';

Observable.prototype.timeInterval = timeInterval;

declare module '../../internal/Observable' {
  interface Observable<T> {
    timeInterval: typeof timeInterval;
  }
}
