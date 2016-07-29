
import {Observable} from '../../Observable';
import {reduce, ReduceSignature} from '../../operator/reduce';

Observable.prototype.reduce = reduce;

declare module '../../Observable' {
  interface IObservable<T> {
    reduce: ReduceSignature<T>;
  }
}