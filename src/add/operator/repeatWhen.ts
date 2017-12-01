
import { Observable } from '../../Observable';
import { repeatWhen } from '../../internal/patching/operator/repeatWhen';

Observable.prototype.repeatWhen = repeatWhen;

declare module '../../Observable' {
  interface Observable<T> {
    repeatWhen: typeof repeatWhen;
  }
}
