
import { Observable } from '../../internal/Observable';
import { count } from '../../internal/patching/operator/count';

Observable.prototype.count = count;

declare module '../../internal/Observable' {
  interface Observable<T> {
    count: typeof count;
  }
}
