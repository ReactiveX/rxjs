
import { Observable } from '../../Observable';
import { timeInterval, TimeIntervalSignature } from '../../operator/timeInterval';

Observable.prototype.timeInterval = timeInterval;

declare module '../../Observable' {
  interface Observable<T> {
    timeInterval: TimeIntervalSignature<T>;
  }
}