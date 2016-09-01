
import { Observable } from '../../Observable';
import { repeatWhen, RepeatWhenSignature } from '../../operator/repeatWhen';

Observable.prototype.repeatWhen = repeatWhen;

declare module '../../Observable' {
  interface Observable<T> {
    repeatWhen: RepeatWhenSignature<T>;
  }
}