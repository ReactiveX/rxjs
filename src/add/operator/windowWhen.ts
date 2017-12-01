
import { Observable } from '../../Observable';
import { windowWhen } from '../../internal/patching/operator/windowWhen';

Observable.prototype.windowWhen = windowWhen;

declare module '../../Observable' {
  interface Observable<T> {
    windowWhen: typeof windowWhen;
  }
}
