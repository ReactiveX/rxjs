
import {Observable, IObservable} from '../../Observable';
import {elementAt, ElementAtSignature} from '../../operator/elementAt';

Observable.prototype.elementAt = elementAt;

declare module '../../Observable' {
  interface IObservable<T> {
    elementAt: ElementAtSignature<T>;
  }
}