
import {Observable, IObservable} from '../../Observable';
import {concatAll, ConcatAllSignature} from '../../operator/concatAll';

Observable.prototype.concatAll = concatAll;

declare module '../../Observable' {
  interface IObservable<T> {
    concatAll: ConcatAllSignature<T>;
  }
}