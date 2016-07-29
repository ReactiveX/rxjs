import {Observable, IObservable} from '../../Observable';
import {distinctKey, DistinctKeySignature} from '../../operator/distinctKey';

Observable.prototype.distinctKey = distinctKey;

declare module '../../Observable' {
  interface IObservable<T> {
    distinctKey: DistinctKeySignature<T>;
  }
}