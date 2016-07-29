
import {Observable, IObservable} from '../../Observable';
import {every, EverySignature} from '../../operator/every';

Observable.prototype.every = every;

declare module '../../Observable' {
  interface IObservable<T> {
    every: EverySignature<T>;
  }
}