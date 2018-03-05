
import { Observable } from '../../internal/Observable';
import { publishLast } from '../../internal/patching/operator/publishLast';

Observable.prototype.publishLast = publishLast;

declare module '../../internal/Observable' {
  interface Observable<T> {
    publishLast: typeof publishLast;
  }
}
