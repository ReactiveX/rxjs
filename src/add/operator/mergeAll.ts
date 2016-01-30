
import {Observable} from '../../Observable';
import {mergeAll, MergeAllSignature} from '../../operator/mergeAll';

Observable.prototype.mergeAll = mergeAll;

declare module '../../Observable' {
  interface Observable<T> {
    mergeAll: MergeAllSignature<T>;
  }
}