
import { Observable } from '../../internal/Observable';
import { skipUntil } from '../../internal/patching/operator/skipUntil';

Observable.prototype.skipUntil = skipUntil;

declare module '../../internal/Observable' {
  interface Observable<T> {
    skipUntil: typeof skipUntil;
  }
}
