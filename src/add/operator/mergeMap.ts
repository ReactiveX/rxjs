
import {Observable} from '../../Observable';
import {mergeMap, MergeMapSignature} from '../../operator/mergeMap';

Observable.prototype.mergeMap = <any>mergeMap;
Observable.prototype.flatMap = <any>mergeMap;

declare module '../../Observable' {
  interface Observable<T> {
    flatMap: MergeMapSignature<T>;
    mergeMap: MergeMapSignature<T>;
  }
}