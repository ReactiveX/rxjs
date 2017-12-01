
import { Observable } from '../../Observable';
import { map } from '../../internal/patching/operator/map';

Observable.prototype.map = map;

declare module '../../Observable' {
  interface Observable<T> {
    map: typeof map;
  }
}
