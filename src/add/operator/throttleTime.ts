
import {Observable} from '../../Observable';
import {throttleTime, ThrottleTimeSignature} from '../../operator/throttleTime';

Observable.prototype.throttleTime = throttleTime;

declare module '../../Observable' {
  interface Observable<T> {
    throttleTime: ThrottleTimeSignature<T>;
  }
}