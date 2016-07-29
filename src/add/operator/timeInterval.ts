
import {Observable} from '../../Observable';
import {timeInterval, TimeIntervalSignature} from '../../operator/timeInterval';

Observable.prototype.timeInterval = timeInterval;

declare module '../../Observable' {
  interface IObservable<T> {
    timeInterval: TimeIntervalSignature<T>;
  }
}