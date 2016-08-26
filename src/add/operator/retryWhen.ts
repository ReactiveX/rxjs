
import { Observable } from '../../Observable';
import { retryWhen, RetryWhenSignature } from '../../operator/retryWhen';

Observable.prototype.retryWhen = retryWhen;

declare module '../../Observable' {
  interface Observable<T> {
    retryWhen: RetryWhenSignature<T>;
  }
}