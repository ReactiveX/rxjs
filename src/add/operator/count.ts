
import { Observable } from '../../Observable';
import { count } from '../../internal/patching/operator/count';

Observable.prototype.count = count;

declare module '../../Observable' {
  interface Observable<T> {
    count: typeof count;
  }
}
