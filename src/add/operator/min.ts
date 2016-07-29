
import {Observable} from '../../Observable';
import {min, MinSignature} from '../../operator/min';

Observable.prototype.min = min;

declare module '../../Observable' {
  interface IObservable<T> {
    min: MinSignature<T>;
  }
}