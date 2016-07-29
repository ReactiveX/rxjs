
import {Observable, IObservable} from '../../Observable';
import {repeat, RepeatSignature} from '../../operator/repeat';

Observable.prototype.repeat = repeat;

declare module '../../Observable' {
  interface IObservable<T> {
    repeat: RepeatSignature<T>;
  }
}