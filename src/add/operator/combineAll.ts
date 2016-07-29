
import {Observable, IObservable} from '../../Observable';
import {combineAll, CombineAllSignature} from '../../operator/combineAll';

Observable.prototype.combineAll = combineAll;

declare module '../../Observable' {
  interface IObservable<T> {
    combineAll: CombineAllSignature<T>;
  }
}