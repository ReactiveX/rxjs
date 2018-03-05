
import { Observable } from '../../internal/Observable';
import { _catch } from '../../internal/patching/operator/catch';

Observable.prototype.catch = _catch;
Observable.prototype._catch = _catch;

declare module '../../internal/Observable' {
  interface Observable<T> {
    catch: typeof _catch;
    _catch: typeof _catch;
  }
}
