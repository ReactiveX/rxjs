
import {Observable} from '../../Observable';
import {max, MaxSignature} from '../../operator/max';

Observable.prototype.max = max;

declare module '../../Observable' {
  interface Observable<T> {
    max: MaxSignature<T>;
  }
}