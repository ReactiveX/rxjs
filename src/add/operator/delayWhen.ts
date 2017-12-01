
import { Observable } from '../../internal/Observable';
import { delayWhen } from '../../internal/patching/operator/delayWhen';

Observable.prototype.delayWhen = delayWhen;

declare module '../../internal/Observable' {
  interface Observable<T> {
    delayWhen: typeof delayWhen;
  }
}
