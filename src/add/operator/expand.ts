
import { Observable } from '../../internal/Observable';
import { expand } from '../../internal/patching/operator/expand';

Observable.prototype.expand = expand;

declare module '../../internal/Observable' {
  interface Observable<T> {
    expand: typeof expand;
  }
}
