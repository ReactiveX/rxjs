import { Observable } from '../../Observable';
import { onErrorReturn, OnErrorReturnSignature } from '../../operator/onErrorReturn';

Observable.prototype.onErrorReturn = onErrorReturn;

declare module '../../Observable' {
  interface Observable<T> {
    onErrorReturn: OnErrorReturnSignature<T>;
  }
}
