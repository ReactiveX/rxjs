
import {Observable, IObservable} from '../../Observable';
import {isEmpty, IsEmptySignature} from '../../operator/isEmpty';

Observable.prototype.isEmpty = isEmpty;

declare module '../../Observable' {
  interface IObservable<T> {
    isEmpty: IsEmptySignature<T>;
  }
}