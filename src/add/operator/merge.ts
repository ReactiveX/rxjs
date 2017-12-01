
import { Observable } from '../../Observable';
import { merge } from '../../internal/patching/operator/merge';

Observable.prototype.merge = merge;

declare module '../../Observable' {
  interface Observable<T> {
    merge: typeof merge;
  }
}
