
import {Observable} from '../../Observable';
import {mergeAll, MergeAllSignature} from '../../operator/mergeAll';

Observable.prototype.mergeAll = mergeAll;

declare module '../../Observable' {
  interface IObservable<T> {
    mergeAll: MergeAllSignature<T>;
  }
}