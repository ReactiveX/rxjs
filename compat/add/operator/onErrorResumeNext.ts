import { Observable } from '../../internal/Observable';
import { onErrorResumeNext } from '../../internal/patching/operator/onErrorResumeNext';

Observable.prototype.onErrorResumeNext = onErrorResumeNext;

declare module '../../internal/Observable' {
  interface Observable<T> {
    onErrorResumeNext: typeof onErrorResumeNext;
  }
}
