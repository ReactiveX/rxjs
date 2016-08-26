import { Observable } from '../../Observable';
import { onErrorResumeNext, OnErrorResumeNextSignature } from '../../operator/onErrorResumeNext';

Observable.prototype.onErrorResumeNext = onErrorResumeNext;

declare module '../../Observable' {
  interface Observable<T> {
    onErrorResumeNext: OnErrorResumeNextSignature<T>;
  }
}