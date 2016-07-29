import {Observable} from '../../Observable';
import {takeLast, TakeLastSignature} from '../../operator/takeLast';

Observable.prototype.takeLast = takeLast;

declare module '../../Observable' {
  interface IObservable<T> {
    takeLast: TakeLastSignature<T>;
  }
}