
import {Observable} from '../../Observable';
import {windowToggle, WindowToggleSignature} from '../../operator/windowToggle';

Observable.prototype.windowToggle = windowToggle;

declare module '../../Observable' {
  interface IObservable<T> {
    windowToggle: WindowToggleSignature<T>;
  }
}