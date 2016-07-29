
import {Observable, IObservable} from '../../Observable';
import {skipUntil, SkipUntilSignature} from '../../operator/skipUntil';

Observable.prototype.skipUntil = skipUntil;

declare module '../../Observable' {
  interface IObservable<T> {
    skipUntil: SkipUntilSignature<T>;
  }
}