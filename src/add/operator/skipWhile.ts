
import { Observable } from '../../internal/Observable';
import { skipWhile } from '../../internal/patching/operator/skipWhile';

Observable.prototype.skipWhile = skipWhile;

declare module '../../internal/Observable' {
  interface Observable<T> {
    skipWhile: typeof skipWhile;
  }
}
