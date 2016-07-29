
import {Observable, IObservable} from '../../Observable';
import {take, TakeSignature} from '../../operator/take';

Observable.prototype.take = take;

declare module '../../Observable' {
  interface IObservable<T> {
    take: TakeSignature<T>;
  }
}