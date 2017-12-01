
import { Observable } from '../../internal/Observable';
import { exhaustMap } from '../../internal/patching/operator/exhaustMap';

Observable.prototype.exhaustMap = exhaustMap;

declare module '../../internal/Observable' {
  interface Observable<T> {
    exhaustMap: typeof exhaustMap;
  }
}
