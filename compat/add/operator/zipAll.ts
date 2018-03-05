
import { Observable } from '../../internal/Observable';
import { zipAll } from '../../internal/patching/operator/zipAll';

Observable.prototype.zipAll = zipAll;

declare module '../../internal/Observable' {
  interface Observable<T> {
    zipAll: typeof zipAll;
  }
}
