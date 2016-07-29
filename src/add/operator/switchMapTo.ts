
import {Observable} from '../../Observable';
import {switchMapTo, SwitchMapToSignature} from '../../operator/switchMapTo';

Observable.prototype.switchMapTo = switchMapTo;

declare module '../../Observable' {
  interface IObservable<T> {
    switchMapTo: SwitchMapToSignature<T>;
  }
}