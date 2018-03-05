import { Observable } from '../../internal/Observable';
import { distinct } from '../../internal/patching/operator/distinct';

Observable.prototype.distinct = distinct;

declare module '../../internal/Observable' {
  interface Observable<T> {
    distinct: typeof distinct;
  }
}
