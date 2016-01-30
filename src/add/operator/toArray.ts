
import {Observable} from '../../Observable';
import {toArray, ToArraySignature} from '../../operator/toArray';

Observable.prototype.toArray = toArray;

declare module '../../Observable' {
  interface Observable<T> {
    toArray: ToArraySignature<T>;
  }
}