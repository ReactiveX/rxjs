import {Observable} from '../../Observable';
import {onErrorResumeNext, OnErrorResumeNextSignature} from '../../operator/onErrorResumeNext';

Observable.prototype.onErrorResumeNext = onErrorResumeNext;

declare module '../../Observable' {
  interface IObservable<T> {
    onErrorResumeNext: OnErrorResumeNextSignature<T>;
  }
}