
import { Observable } from '../../Observable';
import { retryWhen } from '../../internal/patching/operator/retryWhen';

Observable.prototype.retryWhen = retryWhen;

declare module '../../Observable' {
  interface Observable<T> {
    retryWhen: typeof retryWhen;
  }
}
