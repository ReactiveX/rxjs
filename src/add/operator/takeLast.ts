import { Observable } from '../../Observable';
import { takeLast } from '../../internal/patching/operator/takeLast';

Observable.prototype.takeLast = takeLast;

declare module '../../Observable' {
  interface Observable<T> {
    takeLast: typeof takeLast;
  }
}
