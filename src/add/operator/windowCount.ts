
import { Observable } from '../../Observable';
import { windowCount } from '../../internal/patching/operator/windowCount';

Observable.prototype.windowCount = windowCount;

declare module '../../Observable' {
  interface Observable<T> {
    windowCount: typeof windowCount;
  }
}
