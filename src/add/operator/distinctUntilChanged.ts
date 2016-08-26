
import { Observable } from '../../Observable';
import { distinctUntilChanged, DistinctUntilChangedSignature } from '../../operator/distinctUntilChanged';

Observable.prototype.distinctUntilChanged = distinctUntilChanged;

declare module '../../Observable' {
  interface Observable<T> {
    distinctUntilChanged: DistinctUntilChangedSignature<T>;
  }
}