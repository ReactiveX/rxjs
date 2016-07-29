
import {Observable, IObservable} from '../../Observable';
import {timeout, TimeoutSignature} from '../../operator/timeout';

Observable.prototype.timeout = timeout;

declare module '../../Observable' {
  interface IObservable<T> {
    timeout: TimeoutSignature<T>;
  }
}