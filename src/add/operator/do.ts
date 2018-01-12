
import { Observable } from '../../internal/Observable';
import { _do } from '../../internal/patching/operator/do';

Observable.prototype.do = _do;
Observable.prototype._do = _do;

declare module '../../internal/Observable' {
  interface Observable<T> {
    do: typeof _do;
    _do: typeof _do;
  }
}
