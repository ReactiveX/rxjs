
import { Observable } from '../../Observable';
import { concatAll, ConcatAllSignature } from '../../operator/concatAll';

Observable.prototype.concatAll = concatAll;

declare module '../../Observable' {
  interface Observable<T> {
    concatAll: ConcatAllSignature<T>;
  }
}