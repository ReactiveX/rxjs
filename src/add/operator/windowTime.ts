
import {Observable} from '../../Observable';
import {windowTime, WindowTimeSignature} from '../../operator/windowTime';

Observable.prototype.windowTime = windowTime;

declare module '../../Observable' {
  interface Observable<T> {
    windowTime: WindowTimeSignature<T>;
  }
}