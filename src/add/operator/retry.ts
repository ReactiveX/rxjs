
import {Observable, IObservable} from '../../Observable';
import {retry, RetrySignature} from '../../operator/retry';

Observable.prototype.retry = retry;

declare module '../../Observable' {
  interface IObservable<T> {
    retry: RetrySignature<T>;
  }
}