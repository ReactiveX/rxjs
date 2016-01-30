
import {Observable} from '../../Observable';
import {timeoutWith, TimeoutWithSignature} from '../../operator/timeoutWith';

Observable.prototype.timeoutWith = timeoutWith;

declare module '../../Observable' {
  interface Observable<T> {
    timeoutWith: TimeoutWithSignature<T>;
  }
}