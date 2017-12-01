
import { Observable } from '../../Observable';
import { exhaustMap } from '../../internal/patching/operator/exhaustMap';

Observable.prototype.exhaustMap = exhaustMap;

declare module '../../Observable' {
  interface Observable<T> {
    exhaustMap: typeof exhaustMap;
  }
}
