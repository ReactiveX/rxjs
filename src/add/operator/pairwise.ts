
import { Observable } from '../../Observable';
import { pairwise } from '../../internal/patching/operator/pairwise';

Observable.prototype.pairwise = pairwise;

declare module '../../Observable' {
  interface Observable<T> {
    pairwise: typeof pairwise;
  }
}
