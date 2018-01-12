
import { Observable } from '../../internal/Observable';
import { concatAll } from '../../internal/patching/operator/concatAll';

Observable.prototype.concatAll = concatAll;

declare module '../../internal/Observable' {
  interface Observable<T> {
    concatAll: typeof concatAll;
  }
}
