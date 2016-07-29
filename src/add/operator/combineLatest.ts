
import {Observable, IObservable} from '../../Observable';
import {combineLatest, CombineLatestSignature} from '../../operator/combineLatest';

Observable.prototype.combineLatest = combineLatest;

declare module '../../Observable' {
  interface IObservable<T> {
    combineLatest: CombineLatestSignature<T>;
  }
}