
import { Observable } from '../../Observable';
import { repeat, RepeatSignature } from '../../operator/repeat';

Observable.prototype.repeat = repeat;

declare module '../../Observable' {
  interface Observable<T> {
    repeat: RepeatSignature<T>;
  }
}