
import { Observable } from '../../Observable';
import { skip, SkipSignature } from '../../operator/skip';

Observable.prototype.skip = skip;

declare module '../../Observable' {
  interface Observable<T> {
    skip: SkipSignature<T>;
  }
}