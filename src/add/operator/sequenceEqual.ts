
import { Observable } from '../../Observable';
import { sequenceEqual, SequenceEqualSignature } from '../../operator/sequenceEqual';

Observable.prototype.sequenceEqual = sequenceEqual;

declare module '../../Observable' {
  interface Observable<T> {
    sequenceEqual: SequenceEqualSignature<T>;
  }
}