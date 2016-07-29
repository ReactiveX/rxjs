
import {Observable, IObservable} from '../../Observable';
import {observeOn, ObserveOnSignature} from '../../operator/observeOn';

Observable.prototype.observeOn = observeOn;

declare module '../../Observable' {
  interface IObservable<T> {
    observeOn: ObserveOnSignature<T>;
  }
}