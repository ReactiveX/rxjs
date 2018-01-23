
import { Observable } from '../../internal/Observable';
import { skip } from '../../internal/patching/operator/skip';

Observable.prototype.skip = skip;

declare module '../../internal/Observable' {
  interface Observable<T> {
    skip: typeof skip;
  }
}
