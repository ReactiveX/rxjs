import {Observable} from '../../Observable';
import {distinctKey, DistinctKeySignature} from '../../operator/distinctKey';

Observable.prototype.distinctKey = distinctKey;

declare module '../../Observable' {
  interface Observable<T> {
    distinctKey: DistinctKeySignature<T>;
  }
}