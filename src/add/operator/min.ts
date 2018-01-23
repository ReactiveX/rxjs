
import { Observable } from '../../internal/Observable';
import { min } from '../../internal/patching/operator/min';

Observable.prototype.min = min;

declare module '../../internal/Observable' {
  interface Observable<T> {
    min: typeof min;
  }
}
