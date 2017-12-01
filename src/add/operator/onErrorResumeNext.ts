import { Observable } from '../../Observable';
import { onErrorResumeNext } from '../../internal/patching/operator/onErrorResumeNext';

Observable.prototype.onErrorResumeNext = onErrorResumeNext;

declare module '../../Observable' {
  interface Observable<T> {
    onErrorResumeNext: typeof onErrorResumeNext;
  }
}
