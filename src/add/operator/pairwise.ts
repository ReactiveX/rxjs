
import { Observable } from '../../internal/Observable';
import { pairwise } from '../../internal/patching/operator/pairwise';

Observable.prototype.pairwise = pairwise;

declare module '../../internal/Observable' {
  interface Observable<T> {
    pairwise: typeof pairwise;
  }
}
