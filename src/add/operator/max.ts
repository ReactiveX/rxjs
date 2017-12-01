
import { Observable } from '../../Observable';
import { max } from '../../internal/patching/operator/max';

Observable.prototype.max = max;

declare module '../../Observable' {
  interface Observable<T> {
    max: typeof max;
  }
}
