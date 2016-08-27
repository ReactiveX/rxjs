
import { Observable } from '../../Observable';
import { combineAll, CombineAllSignature } from '../../operator/combineAll';

Observable.prototype.combineAll = combineAll;

declare module '../../Observable' {
  interface Observable<T> {
    combineAll: CombineAllSignature<T>;
  }
}