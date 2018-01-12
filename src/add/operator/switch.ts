
import { Observable } from '../../internal/Observable';
import { _switch } from '../../internal/patching/operator/switch';

Observable.prototype.switch = _switch;
Observable.prototype._switch = _switch;

declare module '../../internal/Observable' {
  interface Observable<T> {
    switch: typeof _switch;
    _switch: typeof _switch;
  }
}
