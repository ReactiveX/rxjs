
import {Observable} from '../../Observable';
import {concatMap, ConcatMapSignature} from '../../operator/concatMap';

Observable.prototype.concatMap = concatMap;

declare module '../../Observable' {
  interface Observable<T> {
    concatMap: ConcatMapSignature<T>;
  }
}