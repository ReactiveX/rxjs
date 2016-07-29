
import {Observable, IObservable} from '../../Observable';
import {mergeMapTo, MergeMapToSignature} from '../../operator/mergeMapTo';

Observable.prototype.flatMapTo = <any>mergeMapTo;
Observable.prototype.mergeMapTo = <any>mergeMapTo;

declare module '../../Observable' {
  interface IObservable<T> {
    flatMapTo: MergeMapToSignature<T>;
    mergeMapTo: MergeMapToSignature<T>;
  }
}