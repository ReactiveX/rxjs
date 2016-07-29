
import {Observable} from '../../Observable';
import {exhaust, SwitchFirstSignature} from '../../operator/exhaust';

Observable.prototype.exhaust = exhaust;

declare module '../../Observable' {
  interface IObservable<T> {
    exhaust: SwitchFirstSignature<T>;
  }
}