
import {Observable} from '../../Observable';
import {max, MaxSignature} from '../../operator/max';

Observable.prototype.max = max;

declare module '../../Observable' {
  interface IObservable<T> {
    max: MaxSignature<T>;
  }
}