
import { Observable } from '../../Observable';
import { concatMap } from '../../internal/patching/operator/concatMap';

Observable.prototype.concatMap = concatMap;

declare module '../../Observable' {
  interface Observable<T> {
    concatMap: typeof concatMap;
  }
}
