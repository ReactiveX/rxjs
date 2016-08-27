
import { Observable } from '../../Observable';
import { windowCount, WindowCountSignature } from '../../operator/windowCount';

Observable.prototype.windowCount = windowCount;

declare module '../../Observable' {
  interface Observable<T> {
    windowCount: WindowCountSignature<T>;
  }
}