
import { Observable } from '../../internal/Observable';
import { retry } from '../../internal/patching/operator/retry';

Observable.prototype.retry = retry;

declare module '../../internal/Observable' {
  interface Observable<T> {
    retry: typeof retry;
  }
}
