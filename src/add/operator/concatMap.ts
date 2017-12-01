
import { Observable } from '../../internal/Observable';
import { concatMap } from '../../internal/patching/operator/concatMap';

Observable.prototype.concatMap = concatMap;

declare module '../../internal/Observable' {
  interface Observable<T> {
    concatMap: typeof concatMap;
  }
}
