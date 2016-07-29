import {Observable, IObservable} from '../../Observable';
import {distinct, DistinctSignature} from '../../operator/distinct';

Observable.prototype.distinct = distinct;

declare module '../../Observable' {
  interface IObservable<T> {
    distinct: DistinctSignature<T>;
  }
}