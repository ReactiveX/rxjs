
import {Observable} from '../../Observable';
import {defaultIfEmpty, DefaultIfEmptySignature} from '../../operator/defaultIfEmpty';

Observable.prototype.defaultIfEmpty = defaultIfEmpty;

declare module '../../Observable' {
  interface IObservable<T> {
    defaultIfEmpty: DefaultIfEmptySignature<T>;
  }
}