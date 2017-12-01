
import { Observable } from '../../Observable';
import { retry } from '../../internal/patching/operator/retry';

Observable.prototype.retry = retry;

declare module '../../Observable' {
  interface Observable<T> {
    retry: typeof retry;
  }
}
