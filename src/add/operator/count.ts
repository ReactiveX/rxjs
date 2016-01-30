
import {Observable} from '../../Observable';
import {count, CountSignature} from '../../operator/count';

Observable.prototype.count = count;

declare module '../../Observable' {
  interface Observable<T> {
    count: CountSignature<T>;
  }
}