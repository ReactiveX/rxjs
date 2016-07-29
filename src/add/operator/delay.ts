
import {Observable, IObservable} from '../../Observable';
import {delay, DelaySignature} from '../../operator/delay';

Observable.prototype.delay = delay;

declare module '../../Observable' {
  interface IObservable<T> {
    delay: DelaySignature<T>;
  }
}