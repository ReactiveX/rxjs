
import { Observable } from '../../internal/Observable';
import { concatMapTo } from '../../internal/patching/operator/concatMapTo';

Observable.prototype.concatMapTo = concatMapTo;

declare module '../../internal/Observable' {
  interface Observable<T> {
    concatMapTo: typeof concatMapTo;
  }
}
