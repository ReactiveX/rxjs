
import {Observable} from '../../Observable';
import {retryWhen, RetryWhenSignature} from '../../operator/retryWhen';

Observable.prototype.retryWhen = retryWhen;

declare module '../../Observable' {
  interface IObservable<T> {
    retryWhen: RetryWhenSignature<T>;
  }
}