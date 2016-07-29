
import {Observable, IObservable} from '../../Observable';
import {pluck, PluckSignature} from '../../operator/pluck';

Observable.prototype.pluck = pluck;

declare module '../../Observable' {
  interface IObservable<T> {
    pluck: PluckSignature<T>;
  }
}