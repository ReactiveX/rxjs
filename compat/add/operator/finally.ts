
import { Observable } from '../../internal/Observable';
import { _finally } from '../../internal/patching/operator/finally';

Observable.prototype.finally = _finally;
Observable.prototype._finally = _finally;

declare module '../../internal/Observable' {
  interface Observable<T> {
    finally: typeof _finally;
    _finally: typeof _finally;
  }
}
