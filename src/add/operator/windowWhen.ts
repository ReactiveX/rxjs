
import {Observable} from '../../Observable';
import {windowWhen, WindowWhenSignature} from '../../operator/windowWhen';

Observable.prototype.windowWhen = windowWhen;

declare module '../../Observable' {
  interface IObservable<T> {
    windowWhen: WindowWhenSignature<T>;
  }
}