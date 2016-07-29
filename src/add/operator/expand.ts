
import {Observable, IObservable} from '../../Observable';
import {expand, ExpandSignature} from '../../operator/expand';

Observable.prototype.expand = expand;

declare module '../../Observable' {
  interface IObservable<T> {
    expand: ExpandSignature<T>;
  }
}