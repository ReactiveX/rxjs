
import { Observable } from '../../internal/Observable';
import { merge } from '../../internal/patching/operator/merge';

Observable.prototype.merge = merge;

declare module '../../internal/Observable' {
  interface Observable<T> {
    merge: typeof merge;
  }
}
