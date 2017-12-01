import { Observable } from '../../Observable';
import { distinct } from '../../internal/patching/operator/distinct';

Observable.prototype.distinct = distinct;

declare module '../../Observable' {
  interface Observable<T> {
    distinct: typeof distinct;
  }
}
