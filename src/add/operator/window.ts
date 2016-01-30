
import {Observable} from '../../Observable';
import {window, WindowSignature} from '../../operator/window';

Observable.prototype.window = window;

declare module '../../Observable' {
  interface Observable<T> {
    window: WindowSignature<T>;
  }
}