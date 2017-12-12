
import { Observable } from '../../Observable';
import { join } from '../../operator/join';

Observable.prototype.join = join;

declare module '../../Observable' {
  interface Observable<T> {
    join: typeof join;
  }
}
