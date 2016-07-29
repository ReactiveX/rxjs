
import {Observable} from '../../Observable';
import {throttle, ThrottleSignature} from '../../operator/throttle';

Observable.prototype.throttle = throttle;

declare module '../../Observable' {
  interface IObservable<T> {
    throttle: ThrottleSignature<T>;
  }
}