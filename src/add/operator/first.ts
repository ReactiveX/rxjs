
import {Observable, IObservable} from '../../Observable';
import {first, FirstSignature} from '../../operator/first';

Observable.prototype.first = <any>first;

declare module '../../Observable' {
  interface IObservable<T> {
    first: FirstSignature<T>;
  }
}