
import {Observable} from '../../Observable';
import {distinctUntilKeyChanged, DistinctUntilKeyChangedSignature} from '../../operator/distinctUntilKeyChanged';

Observable.prototype.distinctUntilKeyChanged = distinctUntilKeyChanged;

declare module '../../Observable' {
  interface IObservable<T> {
    distinctUntilKeyChanged: DistinctUntilKeyChangedSignature<T>;
  }
}