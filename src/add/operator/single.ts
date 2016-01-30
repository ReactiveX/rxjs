
import {Observable} from '../../Observable';
import {single, SingleSignature} from '../../operator/single';

Observable.prototype.single = single;

declare module '../../Observable' {
  interface Observable<T> {
    single: SingleSignature<T>;
  }
}