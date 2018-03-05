
import { Observable } from '../../internal/Observable';
import { sequenceEqual } from '../../internal/patching/operator/sequenceEqual';

Observable.prototype.sequenceEqual = sequenceEqual;

declare module '../../internal/Observable' {
  interface Observable<T> {
    sequenceEqual: typeof sequenceEqual;
  }
}
