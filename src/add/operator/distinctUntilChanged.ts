
import {Observable, IObservable} from '../../Observable';
import {distinctUntilChanged, DistinctUntilChangedSignature} from '../../operator/distinctUntilChanged';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

declare module '../../Observable' {
  interface IObservable<T> {
    distinctUntilChanged: DistinctUntilChangedSignature<T>;
  }
}