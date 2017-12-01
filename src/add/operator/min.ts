
import { Observable } from '../../Observable';
import { min } from '../../internal/patching/operator/min';

Observable.prototype.min = min;

declare module '../../Observable' {
  interface Observable<T> {
    min: typeof min;
  }
}
