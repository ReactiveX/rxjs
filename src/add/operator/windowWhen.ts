
import { Observable } from '../../internal/Observable';
import { windowWhen } from '../../internal/patching/operator/windowWhen';

Observable.prototype.windowWhen = windowWhen;

declare module '../../internal/Observable' {
  interface Observable<T> {
    windowWhen: typeof windowWhen;
  }
}
