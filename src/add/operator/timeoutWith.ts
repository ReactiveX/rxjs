
import { Observable } from '../../internal/Observable';
import { timeoutWith } from '../../internal/patching/operator/timeoutWith';

Observable.prototype.timeoutWith = timeoutWith;

declare module '../../internal/Observable' {
  interface Observable<T> {
    timeoutWith: typeof timeoutWith;
  }
}
