
import {Observable} from '../../Observable';
import {concat, ConcatSignature} from '../../operator/concat';

Observable.prototype.concat = concat;

declare module '../../Observable' {
  interface Observable<T> {
    concat: ConcatSignature<T>;
  }
}