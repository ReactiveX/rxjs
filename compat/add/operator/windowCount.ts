
import { Observable } from '../../internal/Observable';
import { windowCount } from '../../internal/patching/operator/windowCount';

Observable.prototype.windowCount = windowCount;

declare module '../../internal/Observable' {
  interface Observable<T> {
    windowCount: typeof windowCount;
  }
}
