import { Observable } from '../../Observable';
import { distinctKey } from '../../operator/distinctKey';

Observable.prototype.distinctKey = distinctKey;

declare module '../../Observable' {
  interface Observable<T> {
    distinctKey: typeof distinctKey;
  }
}