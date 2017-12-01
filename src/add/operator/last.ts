
import { Observable } from '../../Observable';
import { last } from '../../internal/patching/operator/last';

Observable.prototype.last = <any>last;

declare module '../../Observable' {
  interface Observable<T> {
    last: typeof last;
  }
}
