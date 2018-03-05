
import { Observable } from '../../internal/Observable';
import { reduce } from '../../internal/patching/operator/reduce';

Observable.prototype.reduce = reduce;

declare module '../../internal/Observable' {
  interface Observable<T> {
    reduce: typeof reduce;
  }
}
