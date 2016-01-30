
import {Observable} from '../../Observable';
import {windowWhen, WindowWhenSignature} from '../../operator/windowWhen';

Observable.prototype.windowWhen = windowWhen;

declare module '../../Observable' {
  interface Observable<T> {
    windowWhen: WindowWhenSignature<T>;
  }
}