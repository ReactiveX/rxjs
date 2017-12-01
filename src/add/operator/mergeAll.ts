
import { Observable } from '../../internal/Observable';
import { mergeAll } from '../../internal/patching/operator/mergeAll';

Observable.prototype.mergeAll = mergeAll;

declare module '../../internal/Observable' {
  interface Observable<T> {
    mergeAll: typeof mergeAll;
  }
}
