
import { Observable } from '../../Observable';
import { skipWhile } from '../../internal/patching/operator/skipWhile';

Observable.prototype.skipWhile = skipWhile;

declare module '../../Observable' {
  interface Observable<T> {
    skipWhile: typeof skipWhile;
  }
}
