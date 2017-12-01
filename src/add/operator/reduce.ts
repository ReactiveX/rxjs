
import { Observable } from '../../Observable';
import { reduce } from '../../internal/patching/operator/reduce';

Observable.prototype.reduce = reduce;

declare module '../../Observable' {
  interface Observable<T> {
    reduce: typeof reduce;
  }
}
