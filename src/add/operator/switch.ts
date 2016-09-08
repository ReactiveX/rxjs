
import { Observable } from '../../Observable';
import { _switch, SwitchSignature } from '../../operator/switch';

Observable.prototype.switch = _switch;
Observable.prototype._switch = _switch;

declare module '../../Observable' {
  interface Observable<T> {
    switch: SwitchSignature<T>;
    _switch: SwitchSignature<T>;
  }
}