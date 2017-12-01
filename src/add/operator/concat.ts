
import { Observable } from '../../internal/Observable';
import { concat } from '../../internal/patching/operator/concat';

Observable.prototype.concat = concat;

declare module '../../internal/Observable' {
  interface Observable<T> {
    concat: typeof concat;
  }
}
