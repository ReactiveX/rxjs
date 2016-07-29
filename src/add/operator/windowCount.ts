
import {Observable, IObservable} from '../../Observable';
import {windowCount, WindowCountSignature} from '../../operator/windowCount';

Observable.prototype.windowCount = windowCount;

declare module '../../Observable' {
  interface IObservable<T> {
    windowCount: WindowCountSignature<T>;
  }
}