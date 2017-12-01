
import { Observable } from '../../Observable';
import { sequenceEqual } from '../../internal/patching/operator/sequenceEqual';

Observable.prototype.sequenceEqual = sequenceEqual;

declare module '../../Observable' {
  interface Observable<T> {
    sequenceEqual: typeof sequenceEqual;
  }
}
