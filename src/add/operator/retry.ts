
import {Observable} from '../../Observable';
import {retry, RetrySignature} from '../../operator/retry';

Observable.prototype.retry = retry;

declare module '../../Observable' {
  interface Observable<T> {
    retry: RetrySignature<T>;
  }
}