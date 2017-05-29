
import { Observable } from '../../Observable';
import { debug } from '../../operator/debug';

Observable.prototype.debug = debug;

declare module '../../Observable' {
  interface Observable<T> {
    debug: typeof debug;
  }
}
