
import {Observable} from '../../Observable';
import {_finally, FinallySignature} from '../../operator/finally';

Observable.prototype.finally = _finally;

declare module '../../Observable' {
  interface Observable<T> {
    finally: FinallySignature<T>;
  }
}