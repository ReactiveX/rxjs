
import { Observable } from '../../internal/Observable';
import { last } from '../../internal/patching/operator/last';

Observable.prototype.last = <any>last;

declare module '../../internal/Observable' {
  interface Observable<T> {
    last: typeof last;
  }
}
