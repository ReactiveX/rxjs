
import { Observable } from '../../Observable';
import { publishLast } from '../../internal/patching/operator/publishLast';

Observable.prototype.publishLast = publishLast;

declare module '../../Observable' {
  interface Observable<T> {
    publishLast: typeof publishLast;
  }
}
