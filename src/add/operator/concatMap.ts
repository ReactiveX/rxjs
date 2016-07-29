
import {Observable, IObservable} from '../../Observable';
import {concatMap, ConcatMapSignature} from '../../operator/concatMap';

Observable.prototype.concatMap = concatMap;

declare module '../../Observable' {
  interface IObservable<T> {
    concatMap: ConcatMapSignature<T>;
  }
}