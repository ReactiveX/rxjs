import {Observable} from '../../Observable';
import {timestamp, TimestampSignature} from '../../operator/timestamp';

Observable.prototype.timestamp = timestamp;

declare module '../../Observable' {
  interface IObservable<T> {
    timestamp: TimestampSignature<T>;
  }
}