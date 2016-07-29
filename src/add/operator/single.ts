
import {Observable, IObservable} from '../../Observable';
import {single, SingleSignature} from '../../operator/single';

Observable.prototype.single = single;

declare module '../../Observable' {
  interface IObservable<T> {
    single: SingleSignature<T>;
  }
}