
import {Observable} from '../../Observable';
import {timeoutWith, TimeoutWithSignature} from '../../operator/timeoutWith';

Observable.prototype.timeoutWith = timeoutWith;

declare module '../../Observable' {
  interface IObservable<T> {
    timeoutWith: TimeoutWithSignature<T>;
  }
}