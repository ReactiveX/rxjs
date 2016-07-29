
import {Observable} from '../../Observable';
import {ReduceSignature} from '../../operator/reduce';
import {scan} from '../../operator/scan';

Observable.prototype.scan = scan;

declare module '../../Observable' {
  interface Observable<T> {
    scan: ReduceSignature<T>;
  }
}