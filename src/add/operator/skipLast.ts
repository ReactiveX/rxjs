import { Observable } from '../../internal/Observable';
import { skipLast } from '../../internal/patching/operator/skipLast';

Observable.prototype.skipLast = skipLast;

declare module '../../internal/Observable' {
  interface Observable<T> {
    skipLast: typeof skipLast;
  }
}
