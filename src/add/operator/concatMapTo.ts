
import { Observable } from '../../Observable';
import { concatMapTo, ConcatMapToSignature } from '../../operator/concatMapTo';

Observable.prototype.concatMapTo = concatMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    concatMapTo: ConcatMapToSignature<T>;
  }
}