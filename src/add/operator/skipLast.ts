import { Observable } from '../../Observable';
import { skipLast } from '../../internal/patching/operator/skipLast';

Observable.prototype.skipLast = skipLast;

declare module '../../Observable' {
  interface Observable<T> {
    skipLast: typeof skipLast;
  }
}
