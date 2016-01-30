
import {Observable} from '../../Observable';
import {last, LastSignature} from '../../operator/last';

Observable.prototype.last = <any>last;

declare module '../../Observable' {
  interface Observable<T> {
    last: LastSignature<T>;
  }
}