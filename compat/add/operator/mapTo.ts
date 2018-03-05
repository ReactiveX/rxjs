
import { Observable } from '../../internal/Observable';
import { mapTo } from '../../internal/patching/operator/mapTo';

Observable.prototype.mapTo = mapTo;

declare module '../../internal/Observable' {
  interface Observable<T> {
    mapTo: typeof mapTo;
  }
}
