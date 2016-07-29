
import {Observable, IObservable} from '../../Observable';
import {skipWhile, SkipWhileSignature} from '../../operator/skipWhile';

Observable.prototype.skipWhile = skipWhile;

declare module '../../Observable' {
  interface IObservable<T> {
    skipWhile: SkipWhileSignature<T>;
  }
}