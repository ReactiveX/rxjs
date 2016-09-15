import { Observable } from '../../Observable';
import { toSet, ToSetSignature } from '../../operator/toSet';

Observable.prototype.toSet = toSet;

declare module '../../Observable' {
  interface Observable<T> {
    toSet: ToSetSignature<T>;
  }
}
