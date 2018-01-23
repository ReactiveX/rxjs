
import { Observable } from '../../internal/Observable';
import { single } from '../../internal/patching/operator/single';

Observable.prototype.single = single;

declare module '../../internal/Observable' {
  interface Observable<T> {
    single: typeof single;
  }
}
