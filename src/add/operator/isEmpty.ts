
import { Observable } from '../../Observable';
import { isEmpty, IsEmptySignature } from '../../operator/isEmpty';

Observable.prototype.isEmpty = isEmpty;

declare module '../../Observable' {
  interface Observable<T> {
    isEmpty: IsEmptySignature<T>;
  }
}