
import {Observable} from '../../Observable';
import {_switch, SwitchSignature} from '../../operator/switch';

Observable.prototype.switch = _switch;

declare module '../../Observable' {
  interface Observable<T> {
    switch: SwitchSignature<T>;
  }
}