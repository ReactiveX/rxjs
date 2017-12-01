
import { Observable } from '../../internal/Observable';
import { repeatWhen } from '../../internal/patching/operator/repeatWhen';

Observable.prototype.repeatWhen = repeatWhen;

declare module '../../internal/Observable' {
  interface Observable<T> {
    repeatWhen: typeof repeatWhen;
  }
}
