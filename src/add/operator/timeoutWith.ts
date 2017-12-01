
import { Observable } from '../../Observable';
import { timeoutWith } from '../../internal/patching/operator/timeoutWith';

Observable.prototype.timeoutWith = timeoutWith;

declare module '../../Observable' {
  interface Observable<T> {
    timeoutWith: typeof timeoutWith;
  }
}
