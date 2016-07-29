
import {Observable, IObservable} from '../../Observable';
import {concat, ConcatSignature} from '../../operator/concat';

Observable.prototype.concat = concat;

declare module '../../Observable' {
  interface IObservable<T> {
    concat: ConcatSignature<T>;
  }
}