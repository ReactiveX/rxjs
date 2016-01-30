
import {Observable} from '../../Observable';
import {skipUntil, SkipUntilSignature} from '../../operator/skipUntil';

Observable.prototype.skipUntil = skipUntil;

declare module '../../Observable' {
  interface Observable<T> {
    skipUntil: SkipUntilSignature<T>;
  }
}