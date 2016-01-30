
import {Observable} from '../../Observable';
import {min, MinSignature} from '../../operator/min';

Observable.prototype.min = min;

declare module '../../Observable' {
  interface Observable<T> {
    min: MinSignature<T>;
  }
}