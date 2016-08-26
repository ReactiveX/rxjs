
import { Observable } from '../../Observable';
import { delayWhen, DelayWhenSignature } from '../../operator/delayWhen';

Observable.prototype.delayWhen = delayWhen;

declare module '../../Observable' {
  interface Observable<T> {
    delayWhen: DelayWhenSignature<T>;
  }
}