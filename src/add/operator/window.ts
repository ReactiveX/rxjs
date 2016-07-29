
import {Observable, IObservable} from '../../Observable';
import {window, WindowSignature} from '../../operator/window';

Observable.prototype.window = window;

declare module '../../Observable' {
  interface IObservable<T> {
    window: WindowSignature<T>;
  }
}