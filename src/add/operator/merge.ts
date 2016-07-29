
import {Observable, IObservable} from '../../Observable';
import {merge, MergeSignature} from '../../operator/merge';

Observable.prototype.merge = merge;

declare module '../../Observable' {
  interface IObservable<T> {
    merge: MergeSignature<T>;
  }
}