
import {Observable, IObservable} from '../../Observable';
import {_switch, SwitchSignature} from '../../operator/switch';

Observable.prototype.switch = _switch;

declare module '../../Observable' {
  interface IObservable<T> {
    switch: SwitchSignature<T>;
  }
}