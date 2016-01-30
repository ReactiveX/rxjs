
import {Observable} from '../../Observable';
import {pairwise, PairwiseSignature} from '../../operator/pairwise';

Observable.prototype.pairwise = pairwise;

declare module '../../Observable' {
  interface Observable<T> {
    pairwise: PairwiseSignature<T>;
  }
}