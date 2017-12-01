
import { Observable } from '../../Observable';
import { single } from '../../internal/patching/operator/single';

Observable.prototype.single = single;

declare module '../../Observable' {
  interface Observable<T> {
    single: typeof single;
  }
}
