
import {Observable, IObservable} from '../../Observable';
import {throttleTime, ThrottleTimeSignature} from '../../operator/throttleTime';

Observable.prototype.throttleTime = throttleTime;

declare module '../../Observable' {
  interface IObservable<T> {
    throttleTime: ThrottleTimeSignature<T>;
  }
}