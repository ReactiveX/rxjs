
import { Observable } from '../../Observable';
import { delayWhen } from '../../internal/patching/operator/delayWhen';

Observable.prototype.delayWhen = delayWhen;

declare module '../../Observable' {
  interface Observable<T> {
    delayWhen: typeof delayWhen;
  }
}
