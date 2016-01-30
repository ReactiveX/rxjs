
import {Observable} from '../../Observable';
import {skipWhile, SkipWhileSignature} from '../../operator/skipWhile';

Observable.prototype.skipWhile = skipWhile;

declare module '../../Observable' {
  interface Observable<T> {
    skipWhile: SkipWhileSignature<T>;
  }
}