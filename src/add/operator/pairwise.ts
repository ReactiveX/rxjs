
import {Observable, IObservable} from '../../Observable';
import {pairwise, PairwiseSignature} from '../../operator/pairwise';

Observable.prototype.pairwise = pairwise;

declare module '../../Observable' {
  interface IObservable<T> {
    pairwise: PairwiseSignature<T>;
  }
}