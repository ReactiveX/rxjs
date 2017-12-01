import { Observable } from '../../internal/Observable';
import { takeLast } from '../../internal/patching/operator/takeLast';

Observable.prototype.takeLast = takeLast;

declare module '../../internal/Observable' {
  interface Observable<T> {
    takeLast: typeof takeLast;
  }
}
