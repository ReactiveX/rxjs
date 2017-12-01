
import { Observable } from '../../Observable';
import { concatMapTo } from '../../internal/patching/operator/concatMapTo';

Observable.prototype.concatMapTo = concatMapTo;

declare module '../../Observable' {
  interface Observable<T> {
    concatMapTo: typeof concatMapTo;
  }
}
