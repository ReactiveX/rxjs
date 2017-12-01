
import { Observable } from '../../Observable';
import { skip } from '../../internal/patching/operator/skip';

Observable.prototype.skip = skip;

declare module '../../Observable' {
  interface Observable<T> {
    skip: typeof skip;
  }
}
