
import { Observable } from '../../internal/Observable';
import { max } from '../../internal/patching/operator/max';

Observable.prototype.max = max;

declare module '../../internal/Observable' {
  interface Observable<T> {
    max: typeof max;
  }
}
