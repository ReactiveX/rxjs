
import { Observable } from '../../internal/Observable';
import { retryWhen } from '../../internal/patching/operator/retryWhen';

Observable.prototype.retryWhen = retryWhen;

declare module '../../internal/Observable' {
  interface Observable<T> {
    retryWhen: typeof retryWhen;
  }
}
