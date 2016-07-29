
import {Observable, IObservable} from '../../Observable';
import {count, CountSignature} from '../../operator/count';

Observable.prototype.count = count;

declare module '../../Observable' {
  interface IObservable<T> {
    count: CountSignature<T>;
  }
}