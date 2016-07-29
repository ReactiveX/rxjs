
import {Observable, IObservable} from '../../Observable';
import {windowTime, WindowTimeSignature} from '../../operator/windowTime';

Observable.prototype.windowTime = windowTime;

declare module '../../Observable' {
  interface IObservable<T> {
    windowTime: WindowTimeSignature<T>;
  }
}